import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("books", function (table) {
    table.increments("id");
    table.string("name", 255).notNullable();
    table.string("author", 255).notNullable();
    table.string("date", 5).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("books");
}
