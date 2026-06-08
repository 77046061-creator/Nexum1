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

  const { data: subjects } = await admin
    .from("subjects")
    .select("display_name")
    .order("display_name");

  const subjectCount = await admin
    .from("items")
    .select("subject_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("subject_id", "is", null);

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
    <div className="relative min-h-screen bg-surface">
      <Sidebar streak={profile?.streak} />

      <div className="pl-60 transition-all duration-300">
        <div className="mx-auto max-w-6xl px-6 pt-6 pb-28">
          <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar archivos, materias..."
                className="w-full rounded-xl border border-outline-variant/30 bg-surface py-2.5 pl-10 pr-4 text-body-md text-on-surface outline-none transition focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/auth/logout"
                className="hidden rounded-lg border border-outline-variant/30 px-3 py-1.5 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface sm:block"
              >
                Salir
              </a>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container to-primary text-sm font-semibold text-on-primary shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total archivos", value: myCount, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "from-primary-container/40 to-primary/10" },
              { label: "Cursos registrados", value: uniqueSubjectsCount, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "from-secondary-fixed-dim/40 to-secondary/10" },
              { label: "Descargas", value: downloadCount || 0, icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10", color: "from-tertiary-fixed-dim/40 to-tertiary/10" },
              { label: "Favoritos", value: favCount || 0, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "from-error-container/30 to-error/10" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.color} opacity-60`} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <p className="text-heading-md font-semibold text-primary">{stat.value}</p>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant/60">
                      {stat.icon.split(" ").map((d, i) => <path key={i} d={d} />)}
                    </svg>
                  </div>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {myCount > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-sm">
              <div className="border-b border-outline-variant/20 px-5 py-3">
                <h2 className="text-label-sm font-semibold text-on-surface">Continuar estudiando</h2>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {recentItems?.map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-container/50"
                  >
                    <span className="text-lg">{typeIcons[item.type] || "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-on-surface truncate group-hover:text-primary-container transition-colors">
                        {item.title}
                      </p>
                      <p className="text-label-xs text-on-surface-variant">
                        {item.subjects?.display_name || "Sin materia"} · {new Date(item.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-on-surface-variant/40">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {recentItems && recentItems.length > 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-label-sm font-semibold text-on-surface">Actividad reciente</h2>
                  <span className="text-label-xs text-on-surface-variant">Hoy</span>
                </div>
                <div className="mt-4 space-y-3">
                  {recentItems.map((item, i) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-xs">
                        {typeIcons[item.type] || "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                          {item.title}
                        </p>
                        <p className="text-label-xs text-on-surface-variant">
                          {i === 0 ? "Ahora" : `Hace ${i + 1} ${i === 0 ? "minuto" : "minutos"}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {popularDocs && popularDocs.length > 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-label-sm font-semibold text-on-surface">Documentos populares</h2>
                  <span className="text-label-xs text-on-surface-variant">Más descargados</span>
                </div>
                <div className="mt-4 space-y-3">
                  {popularDocs.map((item) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-xs">
                        {typeIcons[item.type] || "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                          {item.title}
                        </p>
                        <p className="text-label-xs text-on-surface-variant">
                          {item.downloads} descarga{item.downloads !== 1 && "s"}
                        </p>
                      </div>
                      <span className="text-label-xs text-on-surface-variant/60">{item.downloads}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {topSubjectsList.length > 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
                <h2 className="text-label-sm font-semibold text-on-surface">Cursos más utilizados</h2>
                <div className="mt-4 space-y-3">
                  {topSubjectsList.map(([name, count]) => (
                    <div key={name} className="group flex items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-body-sm text-on-surface">{name}</p>
                          <span className="text-label-xs text-on-surface-variant">{count} archivos</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                          <div
                            className="h-full rounded-full bg-primary-container transition-all"
                            style={{ width: `${(count / Math.max(...topSubjectsList.map(([, c]) => c))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {communityItems && communityItems.length > 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-label-sm font-semibold text-on-surface">Comunidad</h2>
                  <span className="text-label-xs text-on-surface-variant">{communityItems.length} materiales</span>
                </div>
                <div className="mt-4 space-y-3">
                  {communityItems.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-xs">
                        {typeIcons[item.type] || "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                          {item.title}
                        </p>
                        <p className="text-label-xs text-on-surface-variant">
                          {item.users?.username || "Anónimo"} · {item.downloads} descargas
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {myCount === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-surface-container-high to-surface-container text-3xl shadow-sm">
                📭
              </div>
              <h2 className="mt-5 text-heading-md text-primary">
                Tu Depth Board está vacío
              </h2>
              <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
                Sube tu primer archivo con el botón <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-container text-sm text-on-primary">+</span> o desde Discord con{" "}
                <code className="rounded-md bg-surface-container-high px-2 py-0.5 text-label-sm font-mono">
                  /subir
                </code>
              </p>
            </div>
          )}

          {myCount > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
                <h2 className="whitespace-nowrap text-heading-md text-primary">Mis archivos</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items?.map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{
                      background: "linear-gradient(135deg, rgba(31,53,37,0.06), transparent 50%)"
                    }} />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                          {typeLabels[item.type] || item.type}
                        </span>
                        {item.is_verified && (
                          <span className="text-label-sm text-primary">✓ Verificado</span>
                        )}
                      </div>
                      <h3 className="mt-2 text-body-md font-semibold text-primary group-hover:text-primary-container">
                        {item.title}
                      </h3>
                      {item.subjects && (
                        <p className="mt-1 text-label-sm text-on-surface-variant">
                          {item.subjects.display_name}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-label-sm text-on-surface-variant">
                        {item.file_size && (
                          <span>{(item.file_size / 1024 / 1024).toFixed(1)} MB</span>
                        )}
                        <span>⬇ {item.downloads}</span>
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
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
                <h2 className="whitespace-nowrap text-heading-md text-primary">Materiales recientes</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {communityItems.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{
                      background: "linear-gradient(135deg, rgba(31,53,37,0.06), transparent 50%)"
                    }} />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                          {typeLabels[item.type] || item.type}
                        </span>
                        {item.is_verified && (
                          <span className="text-label-sm text-primary">✓ Verificado</span>
                        )}
                      </div>
                      <h3 className="mt-2 text-body-md font-semibold text-primary group-hover:text-primary-container">
                        {item.title}
                      </h3>
                      {item.subjects && (
                        <p className="mt-1 text-label-sm text-on-surface-variant">
                          {item.subjects.display_name}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-label-sm text-on-surface-variant">
                        {item.users?.username && <span>por {item.users.username}</span>}
                        {item.downloads > 0 && <span>⬇ {item.downloads}</span>}
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
