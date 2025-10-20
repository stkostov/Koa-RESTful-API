import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("users_books", function (table) {
        table.integer("user_id").unsigned().notNullable();
        table.integer("book_id").unsigned().notNullable();
        table.foreign("user_id").references("users.id").onDelete("CASCADE");
        table.foreign("book_id").references("books.id").onDelete("CASCADE");
        table.unique(["user_id", "book_id"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users_books");
}
