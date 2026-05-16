const { REST, Routes } = require("discord.js");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const commands = [
  {
    name: "subir",
    description: "Sube un archivo al banco colaborativo",
    options: [
      {
        name: "archivo",
        description: "PDF, imagen o documento académico",
        type: 11,
        required: true,
      },
      {
        name: "titulo",
        description: "Título descriptivo del material",
        type: 3,
        required: true,
      },
      {
        name: "tipo",
        description: "Tipo de material",
        type: 3,
        required: true,
        choices: [
          { name: "Examen", value: "exam" },
          { name: "Práctica", value: "practice" },
          { name: "Resumen", value: "summary" },
          { name: "Fórmula", value: "formula" },
        ],
      },
      {
        name: "materia",
        description: "Nombre de la materia (ej: matematica, fisica)",
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: "nexum",
    description: "Comandos de Nexum",
    options: [
      {
        name: "perfil",
        description: "Muestra tu perfil y estadísticas",
        type: 1,
      },
      {
        name: "buscar",
        description: "Busca material en el banco colaborativo",
        type: 1,
        options: [
          {
            name: "query",
            description: "Término de búsqueda",
            type: 3,
            required: true,
          },
        ],
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN,
);

(async () => {
  try {
    console.log("Registrando comandos slash...");
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
      body: commands,
    });
    console.log("Comandos registrados exitosamente.");
  } catch (error) {
    console.error("Error al registrar comandos:", error);
  }
})();
