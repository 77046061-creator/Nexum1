-- ============================================================
-- NEXUM — Esquema completo de base de datos
-- Banco colaborativo de exámenes
-- ============================================================

-- 1. EXTENSIONES
create extension if not exists "pgcrypto";

-- 2. ENUMS
create type item_type as enum ('exam', 'practice', 'summary', 'formula');

-- 3. TABLAS

-- Usuarios sincronizados con Discord
create table users (
  id            uuid primary key default gen_random_uuid(),
  discord_id    text unique not null,
  username      text not null,
  avatar_url    text,
  email         text,
  streak        integer not null default 0,
  last_active_date date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Materias / Categorías académicas
create table subjects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  display_name  text not null,
  created_at    timestamptz not null default now()
);

-- Ítems académicos (exámenes, prácticas, resúmenes, fórmulas)
create table items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  title         text not null,
  type          item_type not null,
  subject_id    uuid references subjects(id) on delete set null,
  description   text,
  file_url      text not null,
  file_size     integer,
  file_type     text not null default 'application/pdf',
  tags          text[] not null default '{}',
  downloads     integer not null default 0,
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Registro de descargas
create table downloads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  item_id       uuid not null references items(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique(user_id, item_id, created_at)
);

-- Favoritos / Guardados
create table favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  item_id       uuid not null references items(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique(user_id, item_id)
);

-- 4. ÍNDICES

create index idx_items_type on items(type);
create index idx_items_subject on items(subject_id);
create index idx_items_user on items(user_id);
create index idx_items_created on items(created_at desc);
create index idx_items_downloads on items(downloads desc);
create index idx_items_tags on items using gin(tags);
create index idx_downloads_user on downloads(user_id);
create index idx_favorites_user on favorites(user_id);
create index idx_favorites_item on favorites(item_id);
create index idx_users_discord on users(discord_id);
create index idx_users_streak on users(streak desc);

-- 5. FUNCIÓN: actualizar updated_at automáticamente

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at();

create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();

-- 6. FUNCIÓN: incrementar streak del usuario al subir un item

create or replace function update_user_streak()
returns trigger as $$
declare
  today date := current_date;
begin
  update users
  set
    last_active_date = today,
    streak = case
      when last_active_date = today - 1 then streak + 1
      when last_active_date = today then streak
      else 1
    end
  where id = new.user_id;
  return new;
end;
$$ language plpgsql;

create trigger after_item_insert
  after insert on items
  for each row execute function update_user_streak();

-- 7. ROW LEVEL SECURITY

alter table users enable row level security;
alter table subjects enable row level security;
alter table items enable row level security;
alter table downloads enable row level security;
alter table favorites enable row level security;

-- Políticas: usuarios

create policy "Usuarios: select propio"
  on users for select
  using (auth.uid() = id);

create policy "Usuarios: insert solo service_role"
  on users for insert
  with check (auth.role() = 'service_role');

create policy "Usuarios: update propio"
  on users for update
  using (auth.uid() = id);

-- Políticas: materias (lectura pública)

create policy "Materias: select público"
  on subjects for select
  to anon, authenticated
  using (true);

create policy "Materias: insert solo service_role"
  on subjects for insert
  with check (auth.role() = 'service_role');

-- Políticas: items

create policy "Items: select público (verificados)"
  on items for select
  to anon, authenticated
  using (is_verified = true);

create policy "Items: select propios"
  on items for select
  using (auth.uid() = user_id);

create policy "Items: insert propio"
  on items for insert
  with check (auth.uid() = user_id);

create policy "Items: update propio"
  on items for update
  using (auth.uid() = user_id);

create policy "Items: delete propio"
  on items for delete
  using (auth.uid() = user_id);

-- Políticas: descargas

create policy "Downloads: insert propio"
  on downloads for insert
  with check (auth.uid() = user_id);

create policy "Downloads: select propio"
  on downloads for select
  using (auth.uid() = user_id);

-- Políticas: favoritos

create policy "Favorites: select propio"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Favorites: insert propio"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Favorites: delete propio"
  on favorites for delete
  using (auth.uid() = user_id);

-- 8. SEED: materias iniciales

insert into subjects (name, display_name) values
  ('matematica', 'Matemática'),
  ('fisica', 'Física'),
  ('quimica', 'Química'),
  ('biologia', 'Biología'),
  ('historia', 'Historia'),
  ('lengua', 'Lengua y Literatura'),
  ('ingles', 'Inglés'),
  ('programacion', 'Programación'),
  ('economia', 'Economía'),
  ('derecho', 'Derecho')
on conflict (name) do nothing;
