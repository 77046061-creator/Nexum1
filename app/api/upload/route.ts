import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const subjectName = formData.get("subject") as string | null;

  if (!file || !title || !type) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (file, title, type)" },
      { status: 400 },
    );
  }

  const discordId =
    user.identities?.[0]?.id ||
    user.user_metadata?.provider_id ||
    user.user_metadata?.iss?.split("/").pop();

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${discordId || user.id}/${Date.now()}_${file.name}`;

  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from("materiales")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage
    .from("materiales")
    .getPublicUrl(filePath);

  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("discord_id", discordId ?? "")
    .maybeSingle();

  const userId = profile?.id || user.id;

  let subjectId: string | null = null;
  if (subjectName) {
    const { data: subject } = await admin
      .from("subjects")
      .select("id")
      .ilike("name", subjectName)
      .maybeSingle();
    subjectId = subject?.id || null;
  }

  const { error: itemError } = await admin.from("items").insert({
    user_id: userId,
    title,
    type,
    subject_id: subjectId,
    file_url: urlData.publicUrl,
    file_size: file.size,
    file_type: file.type,
  });

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
