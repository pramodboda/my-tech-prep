import { Pool } from "pg";

// Neon requires SSL. This works for Neon's pooled and direct connection
// strings alike. If you point this at a local Postgres instead, set
// PGSSL=false in your .env to disable it.
const useSSL = process.env.PGSSL !== "false";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error", err);
});
