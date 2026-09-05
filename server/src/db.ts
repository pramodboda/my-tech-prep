import { Pool } from "pg";

console.log("DATABASE_URL exists:", Boolean(process.env.DATABASE_URL));

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);

  console.log("DB host:", url.hostname);
  console.log("DB user:", url.username);
  console.log("DB database:", url.pathname);
  console.log("Password exists:", Boolean(url.password));
  console.log("Password length:", url.password.length);
}

const databaseUrl = process.env.DATABASE_URL;

console.log("DATABASE_URL exists:", Boolean(databaseUrl));

if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);

    console.log("DB host:", url.hostname);
    console.log("DB user:", url.username);
    console.log("DB database:", url.pathname);
    console.log("Password exists:", Boolean(url.password));
    console.log("Password length:", url.password.length);
  } catch (error) {
    console.error("DATABASE_URL is invalid:", error);
  }
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error:", err);
});

pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("✅ PostgreSQL connected:", result.rows[0]);
  })
  .catch((error) => {
    console.error("❌ PostgreSQL connection failed:", error);
  });
