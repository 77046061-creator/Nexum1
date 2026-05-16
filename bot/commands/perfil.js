const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const discordId = interaction.user.id;

  const { data: user } = await supabase
    .from("users")
    .select("*, items(count), downloads(count)")
    .eq("discord_id", discordId)
    .single();

  if (!user) {
    return interaction.editReply(
      "Aún no tienes perfil en Nexum. Usa `/subir` para compartir tu primer material.",
    );
  }

  const embed = {
    color: 0x1f3525,
    author: {
      name: interaction.user.username,
      icon_url: interaction.user.displayAvatarURL(),
    },
    fields: [
      { name: "🔥 Racha", value: `${user.streak} días`, inline: true },
      { name: "📤 Subidas", value: `${user.items?.count || 0}`, inline: true },
      {
        name: "📥 Descargas",
        value: `${user.downloads?.count || 0}`,
        inline: true,
      },
    ],
    footer: {
      text: "Nexum — Banco colaborativo de exámenes",
    },
    timestamp: new Date(),
  };

  await interaction.editReply({ embeds: [embed] });
}

module.exports = { execute };
