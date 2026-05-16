const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const file = interaction.options.getAttachment("archivo");
  const title = interaction.options.getString("titulo");
  const type = interaction.options.getString("tipo");
  const subjectName = interaction.options.getString("materia");
  const discordId = interaction.user.id;
  const username = interaction.user.username;
  const avatarUrl = interaction.user.displayAvatarURL();

  if (
    file.contentType &&
    !file.contentType.startsWith("application/") &&
    !file.contentType.startsWith("image/") &&
    !file.contentType.startsWith("text/")
  ) {
    return interaction.editReply(
      "Solo se permiten archivos PDF, imágenes o documentos.",
    );
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${discordId}/${Date.now()}_${file.name}`;

  // Descargar archivo de Discord
  const response = await fetch(file.url);
  const buffer = Buffer.from(await response.arrayBuffer());

  // Subir a Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("materiales")
    .upload(filePath, buffer, {
      contentType: file.contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage error:", uploadError);
    return interaction.editReply(
      `Error al subir el archivo: ${uploadError.message}`,
    );
  }

  const { data: urlData } = supabase.storage
    .from("materiales")
    .getPublicUrl(filePath);

  // Obtener o crear usuario
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordId)
    .maybeSingle();

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    await supabase
      .from("users")
      .update({ username, avatar_url: avatarUrl })
      .eq("discord_id", discordId);
  } else {
    const { data: newUser } = await supabase
      .from("users")
      .insert({
        discord_id: discordId,
        username,
        avatar_url: avatarUrl,
      })
      .select("id")
      .single();
    userId = newUser.id;
  }

  // Obtener materia si se especificó
  let subjectId = null;
  if (subjectName) {
    const { data: subject } = await supabase
      .from("subjects")
      .select("id")
      .ilike("name", subjectName)
      .maybeSingle();
    subjectId = subject?.id || null;
  }

  // Crear item en la base de datos
  const { error: itemError } = await supabase.from("items").insert({
    user_id: userId,
    title,
    type,
    subject_id: subjectId,
    file_url: urlData.publicUrl,
    file_size: file.size,
    file_type: file.contentType,
  });

  if (itemError) {
    console.error("DB error:", itemError);
    return interaction.editReply("Archivo subido pero hubo un error al guardarlo en la base de datos.");
  }

  await interaction.editReply(
    `✅ **${title}** subido correctamente.\n` +
    `📂 Puedes revisarlo en tu Depth Board: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
  );
}

module.exports = { execute };
