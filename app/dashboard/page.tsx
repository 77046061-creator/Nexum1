import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UploadButton from "@/components/upload-button";

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

  const displayName = profile?.username || user.email?.split("@")[0] || "User";

  const typeLabels: Record<string, string> = {
    exam: "Examen",
    practice: "Práctica",
    summary: "Resumen",
    formula: "Fórmula",
  };

  const myCount = items?.length || 0;
  const totalItems = myCount + (communityItems?.length || 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-primary-fixed-dim/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full bg-secondary-fixed-dim/20 blur-3xl [animation-delay:2s]" />
        <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 animate-pulse rounded-full bg-tertiary-fixed-dim/10 blur-3xl [animation-delay:4s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-24 md:px-16">
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/60 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-container to-primary text-on-primary text-heading-md font-semibold shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-heading-md text-primary">Depth Board</h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-body-md text-on-surface-variant">
                  {displayName}
                  {profile && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed-dim/40 px-3 py-0.5 text-label-sm font-medium text-primary">
                      <span className="text-sm">🔥</span> {profile.streak} días
                    </span>
                  )}
                  <span className="hidden text-label-sm text-outline sm:inline">·</span>
                  <span className="text-label-sm text-outline">
                    {myCount} material{myCount !== 1 && "es"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {myCount === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-surface-container-high to-surface-container text-4xl shadow-sm">
              📭
            </div>
            <h2 className="mt-6 text-heading-md text-primary">
              Tu Depth Board está vacío
            </h2>
            <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
          Sube tu primer archivo con el botón <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-container text-sm text-on-primary">+</span> o desde Discord con{" "}
              <code className="rounded-md bg-surface-container-high px-2 py-0.5 text-label-sm font-mono">
                /subir
              </code>
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items?.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
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
        )}

        {communityItems && communityItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
              <h2 className="whitespace-nowrap text-heading-md text-primary">Materiales recientes</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
            </div>
            <p className="mt-2 text-center text-body-md text-on-surface-variant">
              {totalItems} materiales en la comunidad
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communityItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
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

      <UploadButton />
    </div>
  );
}
