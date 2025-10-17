// knexfile.ts
import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: Number(process.env.POSTGRES_DB_PORT) || 5433,
    database: process.env.POSTGRES_DB || "books_store",
    user: process.env.POSTGRES_USER || "user",
    password: process.env.POSTGRES_PASSWORD || "12345678",
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: "./src/migrations",
    tableName: "knex_migrations",
    extension: "ts",
  },
  seeds: { directory: "./src/seed" },
};

module.exports = config;
