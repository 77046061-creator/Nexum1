import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/dashboard-sidebar";
import DashboardFab from "@/components/dashboard-fab";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const discordId =
    user.identities?.[0]?.id ||
    user.user_metadata?.provider_id ||
    user.user_metadata?.iss?.split("/").pop();

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("users")
    .select("id, username, streak")
    .eq("discord_id", discordId ?? "")
    .maybeSingle();

  const userId = profile?.id || user.id;

  const { data: items } = await admin
    .from("items")
    .select("*, subjects(name, display_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: communityItems } = await admin
    .from("items")
    .select("*, subjects(name, display_name), users(username)")
    .neq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  const { count: downloadCount } = await admin
    .from("downloads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: favCount } = await admin
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const topSubjects = await admin
    .from("items")
    .select("subjects(name, display_name)")
    .eq("user_id", userId)
    .not("subject_id", "is", null);

  const subjectFrequency: Record<string, number> = {};
  topSubjects?.data?.forEach((item: any) => {
    if (item.subjects?.display_name) {
      subjectFrequency[item.subjects.display_name] = (subjectFrequency[item.subjects.display_name] || 0) + 1;
    }
  });
  const topSubjectsList = Object.entries(subjectFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const popularDocs = items
    ?.filter((i) => i.downloads > 0)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 4);

  const recentItems = items?.slice(0, 4);

  const displayName = profile?.username || user.email?.split("@")[0] || "User";

  const typeLabels: Record<string, string> = {
    exam: "Examen",
    practice: "Práctica",
    summary: "Resumen",
    formula: "Fórmula",
  };

  const typeIcons: Record<string, string> = {
    exam: "📄",
    practice: "📝",
    summary: "📑",
    formula: "📐",
  };

  const myCount = items?.length || 0;
  const enrolledSubjects = new Set(topSubjects?.data?.map((i: any) => i.subjects?.display_name).filter(Boolean));
  const uniqueSubjectsCount = enrolledSubjects.size;

  return (
    <div className="relative min-h-screen" style={{background:"#eefdf3 url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.06'%3E%3Cpath d='M0 0h1v40H0zM39 0h1v40h-1zM0 0v1h40V0zM0 39v1h40v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\"),radial-gradient(ellipse 80% 60% at 0% 20%,rgba(59,130,246,0.1),transparent),radial-gradient(ellipse 60% 50% at 100% 80%,rgba(139,92,246,0.08),transparent)"}}
    >

      <Sidebar streak={profile?.streak} />

      <div className="pl-60 transition-all duration-300">
        <div className="mx-auto max-w-6xl px-6 pt-6 pb-28">
          <div className="group relative overflow-hidden rounded-2xl border border-primary-container/20 bg-gradient-to-r from-primary-container/5 via-white/70 to-secondary-container/10 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-container/10 via-transparent to-secondary-container/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center gap-4">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar archivos, materias..."
                  className="w-full rounded-xl border border-outline-variant/30 bg-white/80 py-2.5 pl-10 pr-4 text-body-md text-on-surface outline-none transition focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/auth/logout"
                  className="hidden rounded-lg border border-outline-variant/30 px-3 py-1.5 text-label-sm text-on-surface-variant transition-all hover:border-error-container/50 hover:bg-error-container/10 hover:text-error sm:block"
                >
                  Salir
                </a>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-container to-primary text-sm font-semibold text-on-primary shadow-sm ring-2 ring-primary-fixed-dim/30">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-heading-md text-primary">Resumen</h2>
            <p className="mt-0.5 text-body-md text-on-surface-variant">
              Bienvenido de vuelta, {displayName}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total archivos", value: myCount, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", gradient: "from-primary/10 to-primary-container/20", iconBg: "bg-primary/10 text-primary", ring: "ring-primary-fixed-dim/30" },
              { label: "Cursos activos", value: uniqueSubjectsCount, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", gradient: "from-secondary/10 to-secondary-container/20", iconBg: "bg-secondary/10 text-secondary", ring: "ring-secondary-fixed-dim/30" },
              { label: "Descargas", value: downloadCount || 0, icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10", gradient: "from-tertiary/10 to-tertiary-container/20", iconBg: "bg-tertiary/10 text-tertiary", ring: "ring-tertiary-fixed-dim/30" },
              { label: "Favoritos", value: favCount || 0, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", gradient: "from-pink-100/60 via-white to-rose-50/40", iconBg: "bg-rose-100/60 text-rose-600", ring: "ring-rose-200/50" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-80`} />
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/40 blur-xl" />
                <div className="relative">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg} shadow-sm ring-1 ${stat.ring}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {stat.icon.split(" ").map((d, i) => <path key={i} d={d} />)}
                    </svg>
                  </div>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-primary">{stat.value}</p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {myCount > 0 && (
            <div className="mt-8">
              <h2 className="text-heading-md text-primary">Continuar estudiando</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-sm">
                {recentItems?.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className={`group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gradient-to-r hover:from-primary-container/5 hover:via-transparent hover:to-transparent ${
                      i < (recentItems.length - 1) ? "border-b border-outline-variant/10" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container/20 to-primary/10 text-base shadow-sm ring-1 ring-primary-fixed-dim/20">
                      {typeIcons[item.type] || "📄"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md font-medium text-on-surface group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-label-sm text-on-surface-variant">
                        {item.subjects?.display_name && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed-dim/20 px-2 py-0.5 text-primary">
                            {item.subjects.display_name}
                          </span>
                        )}
                        <span>{new Date(item.created_at).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-on-surface-variant/30 transition-colors group-hover:text-primary-container">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(recentItems && recentItems.length > 0 || popularDocs && popularDocs.length > 0) && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {recentItems && recentItems.length > 0 && (
                <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-white/80 via-white/60 to-primary-container/5 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary">⚡</div>
                    <h3 className="text-label-md font-semibold text-on-surface">Actividad reciente</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {recentItems.map((item, i) => (
                      <Link
                        key={item.id}
                        href={`/item/${item.id}`}
                        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-primary-container/10"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container/20 to-primary/10 text-xs ring-1 ring-primary-fixed-dim/20">
                          {typeIcons[item.type] || "📄"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-on-surface group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-label-xs text-on-surface-variant">
                            {i === 0 ? "Justo ahora" : `Hace ${i + 1} min`}
                          </p>
                        </div>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-fixed-dim/20 text-xs text-primary">{i + 1}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {popularDocs && popularDocs.length > 0 && (
                <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-white/80 via-white/60 to-secondary-container/5 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-xs text-secondary">🔥</div>
                    <h3 className="text-label-md font-semibold text-on-surface">Más descargados</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {popularDocs.map((item) => (
                      <Link
                        key={item.id}
                        href={`/item/${item.id}`}
                        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary-container/10"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-container/30 to-secondary/10 text-xs ring-1 ring-secondary-fixed-dim/20">
                          {typeIcons[item.type] || "📄"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-on-surface group-hover:text-secondary transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-label-xs text-on-surface-variant">
                            {item.downloads} descarga{item.downloads !== 1 && "s"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-label-sm font-semibold text-secondary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {item.downloads}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {topSubjectsList.length > 0 && (
            <div className="mt-8">
              <h2 className="text-heading-md text-primary">Cursos más utilizados</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {topSubjectsList.map(([name, count], i) => {
                  const colors = [
                    { bar: "bg-gradient-to-r from-primary-container to-primary", chip: "bg-primary/10 text-primary" },
                    { bar: "bg-gradient-to-r from-secondary-container to-secondary", chip: "bg-secondary/10 text-secondary" },
                    { bar: "bg-gradient-to-r from-tertiary-container to-tertiary", chip: "bg-tertiary/10 text-tertiary" },
                    { bar: "bg-gradient-to-r from-rose-200 to-rose-400", chip: "bg-rose-100 text-rose-600" },
                  ];
                  const c = colors[i % colors.length];
                  const pct = (count / Math.max(...topSubjectsList.map(([, c]) => c))) * 100;
                  return (
                    <div key={name} className="group rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.chip} text-xs font-semibold`}>
                            {name.charAt(0)}
                          </div>
                          <p className="text-body-md font-medium text-on-surface">{name}</p>
                        </div>
                        <span className="text-label-sm font-semibold text-on-surface-variant">{count}</span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                        <div
                          className={`h-full rounded-full ${c.bar} transition-all duration-500 group-hover:opacity-80`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-label-xs text-on-surface-variant">{count} archivo{count !== 1 && "s"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {communityItems && communityItems.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-container/30 to-tertiary/10 text-xs text-tertiary ring-1 ring-tertiary-fixed-dim/20">
                  🌐
                </div>
                <h2 className="text-heading-md text-primary">Comunidad</h2>
                <span className="rounded-full bg-tertiary-container/20 px-2.5 py-0.5 text-label-sm text-tertiary">
                  {communityItems.length} materiales
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {communityItems.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-white/80 to-tertiary-container/5 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-tertiary-container/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                          {typeLabels[item.type] || item.type}
                        </span>
                        {item.is_verified && (
                          <span className="flex items-center gap-1 rounded-full bg-primary-fixed-dim/30 px-2 py-0.5 text-label-sm text-primary">
                            ✓ Verificado
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-body-md font-semibold text-primary transition-colors group-hover:text-primary-container">
                        {item.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-label-sm text-on-surface-variant">
                        {item.subjects?.display_name && (
                          <span className="rounded-full bg-primary-fixed-dim/20 px-2 py-0.5 text-primary">
                            {item.subjects.display_name}
                          </span>
                        )}
                        {item.users?.username && (
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            {item.users.username}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-label-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {item.downloads}
                        </span>
                        {item.file_size && (
                          <span>{(item.file_size / 1024 / 1024).toFixed(1)} MB</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {myCount === 0 && (
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-fixed-dim/30 via-surface-container to-secondary-fixed-dim/30 text-4xl shadow-sm ring-1 ring-primary-fixed-dim/20">
                📭
              </div>
              <h2 className="mt-6 text-heading-lg text-primary">
                Tu Depth Board está vacío
              </h2>
              <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
                Sube tu primer archivo con el botón <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container to-primary text-sm text-on-primary shadow-sm">+</span> o desde Discord con{" "}
                <code className="rounded-md bg-surface-container-high px-2 py-0.5 text-label-sm font-mono text-primary">
                  /subir
                </code>
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: "📄", label: "Exámenes" },
                  { icon: "📝", label: "Prácticas" },
                  { icon: "📐", label: "Fórmulas" },
                ].map((t) => (
                  <div key={t.label} className="rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-sm ring-1 ring-white/50">
                    <span className="text-2xl">{t.icon}</span>
                    <p className="mt-1 text-label-sm text-on-surface-variant">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myCount > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container/30 to-primary/10 text-xs text-primary ring-1 ring-primary-fixed-dim/20">
                  📁
                </div>
                <h2 className="text-heading-md text-primary">Mis archivos</h2>
                <span className="rounded-full bg-primary-fixed-dim/30 px-2.5 py-0.5 text-label-sm text-primary">
                  {myCount} archivos
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items?.map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary-container/8 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container/20 to-primary/10 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gradient-to-r from-surface-container to-primary-fixed-dim/20 px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                          {typeLabels[item.type] || item.type}
                        </span>
                        {item.is_verified && (
                          <span className="flex items-center gap-1 rounded-full bg-primary-fixed-dim/30 px-2 py-0.5 text-label-sm text-primary">
                            ✓ Verificado
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-body-md font-semibold text-primary transition-colors group-hover:text-primary-container">
                        {item.title}
                      </h3>
                      {item.subjects && (
                        <p className="mt-1 text-label-sm text-on-surface-variant">
                          {item.subjects.display_name}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-label-sm text-on-surface-variant">
                        {item.file_size && (
                          <span className="flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                            {(item.file_size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {item.downloads}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {communityItems && communityItems.length > 0 && myCount > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-container/30 to-tertiary/10 text-xs text-tertiary ring-1 ring-tertiary-fixed-dim/20">
                    🌍
                  </div>
                  <h2 className="text-heading-md text-primary">Explorar</h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {communityItems.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-white/70 to-white/40 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary-container/8 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gradient-to-r from-surface-container to-primary-fixed-dim/20 px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                          {typeLabels[item.type] || item.type}
                        </span>
                      </div>
                      <h3 className="mt-2 text-body-md font-semibold text-primary transition-colors group-hover:text-primary-container">
                        {item.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-label-sm text-on-surface-variant">
                        {item.subjects?.display_name && (
                          <span className="rounded-full bg-primary-fixed-dim/20 px-2 py-0.5 text-primary">
                            {item.subjects.display_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                          {item.users?.username || "Anónimo"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-label-sm text-on-surface-variant">
                        <span>{item.downloads} descargas</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DashboardFab />
    </div>
  );
}
