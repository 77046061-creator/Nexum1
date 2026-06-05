import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteButton from "@/components/delete-button";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: item } = await admin
    .from("items")
    .select("*, subjects(name, display_name), users(username)")
    .eq("id", id)
    .single();

  if (!item) notFound();

  const discordId =
    user?.identities?.[0]?.id ||
    user?.user_metadata?.provider_id ||
    user?.user_metadata?.iss?.split("/").pop();

  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("discord_id", discordId ?? "")
    .maybeSingle();

  const userId = profile?.id || user?.id;
  const isOwner = !!userId && item.user_id === userId;

  const typeLabels: Record<string, string> = {
    exam: "Examen",
    practice: "Práctica",
    summary: "Resumen",
    formula: "Fórmula",
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 pt-28 md:px-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface"
        >
          ← Volver al Depth Board
        </Link>

        <div className="mt-6 rounded-xl bg-surface-container-lowest p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
                {typeLabels[item.type] || item.type}
              </span>
              <h1 className="mt-3 text-heading-lg text-primary">
                {item.title}
              </h1>
              {item.subjects && (
                <p className="mt-1 text-body-md text-on-surface-variant">
                  {item.subjects.display_name}
                </p>
              )}
            </div>
            {item.is_verified && (
              <span className="rounded-full bg-primary-fixed-dim px-3 py-1 text-label-sm text-primary">
                ✓ Verificado
              </span>
            )}
          </div>

          {item.description && (
            <p className="mt-6 text-body-md text-on-surface-variant">
              {item.description}
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl bg-surface p-5 text-label-md">
            <div>
              <span className="text-on-surface-variant">Tamaño</span>
              <p className="mt-0.5 font-medium text-on-surface">
                {item.file_size
                  ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB`
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-on-surface-variant">Tipo</span>
              <p className="mt-0.5 font-medium text-on-surface">
                {item.file_type || "—"}
              </p>
            </div>
            <div>
              <span className="text-on-surface-variant">Subido por</span>
              <p className="mt-0.5 font-medium text-on-surface">
                {item.users?.username || "—"}
              </p>
            </div>
            <div>
              <span className="text-on-surface-variant">Descargas</span>
              <p className="mt-0.5 font-medium text-on-surface">
                {item.downloads}
              </p>
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm text-on-surface-variant"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={item.file_url}
            target="_blank"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3.5 text-body-md font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 16L8 12h3V4h2v8h3l-4 4zM5 18h14v2H5v-2z" />
            </svg>
            Descargar archivo
          </a>

          {isOwner && <DeleteButton itemId={item.id} />}
        </div>

        <p className="mt-4 text-center text-label-sm text-on-surface-variant">
          Subido el{" "}
          {new Date(item.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
