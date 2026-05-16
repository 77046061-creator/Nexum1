const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const query = interaction.options.getString("query");

  const { data: items } = await supabase
    .from("items")
    .select("title, type, subjects(display_name), downloads, file_url")
    .ilike("title", `%${query}%`)
    .limit(5);

  if (!items || items.length === 0) {
    return interaction.editReply(
      `No se encontraron resultados para "${query}".`,
    );
  }

  const lines = items.map(
    (item, i) =>
      `${i + 1}. **${item.title}** (${item.type}) — ${item.subjects?.display_name || "Sin materia"} · ${item.downloads} descargas`,
  );

  await interaction.editReply(
    `🔍 Resultados para "${query}":\n\n${lines.join("\n")}\n\n📂 Revisa más en: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
  );
}

module.exports = { execute };
