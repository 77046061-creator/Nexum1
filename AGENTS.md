<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nexum — Banco colaborativo de exámenes

## Visión

Plataforma donde estudiantes comparten material académico (prácticas, exámenes, resúmenes, fórmulas) a través de Discord. Un bot gestiona subidas y perfiles. La web app es el *Depth Board*: tablero personal para revisar, organizar y buscar material.

## Stack

| Capa            | Tecnología                          |
| --------------- | ----------------------------------- |
| Frontend        | Next.js 16 + App Router + Tailwind v4 |
| Backend         | Next.js API Routes                  |
| DB & Backend    | Supabase (PostgreSQL, Storage, Auth, Realtime) |
| Auth            | Discord OAuth + Supabase Auth       |
| File Storage    | Supabase Storage (buckets: `materiales`, `avatars`) |
| Bot             | discord.js                          |
| Deploy          | Vercel + Supabase                   |

## Conexión Supabase

### Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://zowimlemrntlvwqpbikb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Clientes disponibles

- **`lib/supabase/client.ts`** — `createBrowserClient()` para componentes del lado cliente (dashboard, etc.)
- **`lib/supabase/server.ts`** — `createServerClient()` para Server Components y API Routes. Usa `cookies()`.
- **`lib/supabase/admin.ts`** — `createClient()` con service_role para webhooks del bot de Discord (solo server).

## Esquema de base de datos

```sql
-- Enum para tipo de material
create type item_type as enum ('exam', 'practice', 'summary', 'formula');

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

-- Materias académicas
create table subjects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  display_name  text not null,
  created_at    timestamptz not null default now()
);

-- Ítems académicos
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

-- Descargas
create table downloads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  item_id       uuid not null references items(id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- Favoritos
create table favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  item_id       uuid not null references items(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique(user_id, item_id)
);
```

Triggers automáticos: `updated_at` se actualiza solo en users/items. `streak` del usuario se incrementa al subir un nuevo item.

## Seed de materias

matemática, física, química, biología, historia, lengua y literatura, inglés, programación, economía, derecho.

## RLS

- `users`: CRUD propio (service_role para insert)
- `subjects`: SELECT público, INSERT solo service_role
- `items`: SELECT público (verified=true), CRUD propio
- `downloads` / `favorites`: CRUD propio

## Tipos TypeScript

Definidos en `lib/supabase/types.ts` con interfaces `User`, `Subject`, `Item`, `ItemWithRelations`, `Download`, `Favorite` y un objeto `Database` para tipado fuerte del cliente Supabase.

## Discord Bot — Interacción

| Comando            | Acción |
| ------------------ | ------ |
| `/subir [archivo]` | Bot recibe archivo, sube a Storage, crea item en DB, responde con link al Depth Board |
| `/nexum perfil`    | Streak, subidas, descargas |
| `/nexum buscar q`  | Busca en banco colaborativo |

## Discord Bot — Setup

### Requisitos

- `DISCORD_BOT_TOKEN` y `DISCORD_CLIENT_ID` en `.env.local`
- Bot invitado al servidor con permisos: `applications.commands`, `bot` (enviar mensajes, leer historial, adjuntar archivos)

### Archivos del bot

| Archivo | Propósito |
|---------|-----------|
| `bot/index.js` | Punto de entrada, conexión con Discord |
| `bot/deploy-commands.js` | Registra comandos slash en Discord (ejecutar una vez) |
| `bot/commands/subir.js` | Sube archivo a Supabase Storage + crea item en DB |
| `bot/commands/perfil.js` | Muestra estadísticas del usuario |
| `bot/commands/buscar.js` | Busca material en la base de datos |

### Iniciar el bot

```bash
# 1. Registrar comandos (solo la primera vez)
node bot/deploy-commands.js

# 2. Iniciar el bot
node bot/index.js
```

### Flujo de `/subir`

1. Usuario adjunta archivo + escribe título + selecciona tipo
2. Bot descarga el archivo de Discord
3. Sube a Supabase Storage (bucket `materiales`)
4. Crea/actualiza usuario en tabla `users`
5. Crea registro en tabla `items` con tipo + materia
6. Responde con link al Depth Board
