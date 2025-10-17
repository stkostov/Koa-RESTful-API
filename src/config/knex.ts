import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const setup = {
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: Number(process.env.POSTGRES_DB_PORT) || 5433,
    user: process.env.POSTGRES_USER || 'user',
    password: process.env.POSTGRES_PASSWORD || '12345678',
    database: process.env.POSTGRES_DB || 'books_store',
  },
};

export const dbConnectionSetup = setup;
export const db = knex(setup);