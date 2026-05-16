const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

client.commands.set("subir", require("./commands/subir"));
client.commands.set("perfil", require("./commands/perfil"));
client.commands.set("buscar", require("./commands/buscar"));
client.commands.set("ping", {
  execute: async (i) => {
    console.log("Ping recibido");
    await i.reply("pong");
  },
});

client.once("clientReady", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "nexum") {
    const subcommand = interaction.options.getSubcommand();
    const command = client.commands.get(subcommand);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error en /nexum ${subcommand}:`, error);
        await interaction.reply({
          content: "Ocurrió un error al ejecutar el comando.",
          ephemeral: true,
        });
      }
    }
    return;
  }

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log(`Comando no encontrado: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error en /${interaction.commandName}:`, error);
    await interaction.reply({
      content: "Ocurrió un error al ejecutar el comando.",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
