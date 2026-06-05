import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: item } = await admin
    .from("items")
    .select("id, user_id, file_url")
    .eq("id", id)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const discordId =
    user.identities?.[0]?.id ||
    user.user_metadata?.provider_id ||
    user.user_metadata?.iss?.split("/").pop();

  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("discord_id", discordId ?? "")
    .maybeSingle();

  const userId = profile?.id || user.id;

  if (item.user_id !== userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const filePath = item.file_url.split("/materiales/")[1];
  if (filePath) {
    await admin.storage.from("materiales").remove([filePath]);
  }

  const { error: deleteError } = await admin
    .from("items")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
