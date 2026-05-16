const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const formulas = [
  { file: "calculo-diferencial.html", title: "Fórmulas de Cálculo Diferencial", subject: "matematica" },
  { file: "calculo-integral.html", title: "Fórmulas de Cálculo Integral", subject: "matematica" },
  { file: "algebra-lineal.html", title: "Fórmulas de Álgebra Lineal", subject: "matematica" },
  { file: "trigonometria.html", title: "Fórmulas de Trigonometría", subject: "matematica" },
  { file: "fisica-mecanica.html", title: "Fórmulas de Física Mecánica", subject: "fisica" },
  { file: "quimica-general.html", title: "Fórmulas de Química General", subject: "quimica" },
  { file: "estadistica.html", title: "Fórmulas de Estadística", subject: "matematica" },
];

async function seed() {
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", "seed_demo")
    .maybeSingle();

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    await supabase.from("items").delete().eq("user_id", userId);
    console.log("🗑️ Items antiguos eliminados");
  } else {
    const { data: newUser } = await supabase
      .from("users")
      .insert({ discord_id: "seed_demo", username: "Nexum Demo", avatar_url: null })
      .select("id")
      .single();
    userId = newUser.id;
  }

  const dir = path.join(__dirname, "formulas");

  for (const f of formulas) {
    const filePath = path.join(dir, f.file);
    const content = fs.readFileSync(filePath);
    const storagePath = `seed/${Date.now()}_${f.file}`;

    const { error: uploadError } = await supabase.storage
      .from("materiales")
      .upload(storagePath, content, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading ${f.file}:`, uploadError.message);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from("materiales")
      .getPublicUrl(storagePath);

    const { data: subject } = await supabase
      .from("subjects")
      .select("id")
      .eq("name", f.subject)
      .maybeSingle();

    await supabase.from("items").insert({
      user_id: userId,
      title: f.title,
      type: "formula",
      subject_id: subject?.id || null,
      file_url: urlData.publicUrl,
      file_size: content.length,
      file_type: "text/html",
      is_verified: true,
      tags: [f.subject, "formula", "fórmulas"],
    });

    console.log(`✅ ${f.title}`);
  }

  console.log("\n🎯 Seed completado con HTML visual!");
}

seed().catch(console.error);
