const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
require("./commands/subir");
console.log("subir.js loaded OK");
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...");
