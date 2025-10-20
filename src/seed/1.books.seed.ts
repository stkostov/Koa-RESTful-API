import { Knex } from "knex";
import { Book } from "../types/book.type";

export async function seed(knex: Knex): Promise<void> {
    await knex("books").del();

    await knex("books").insert([
        {
            name: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            date: "1925",
        },
        {
            name: "To Kill a Mockingbird",
            author: "Harper Lee",
            date: "1960",
        },
        { name: "1984", author: "George Orwell", date: "1949" },
        { name: "Pride and Prejudice", author: "Jane Austen", date: "1813" },
        {
            name: "The Catcher in the Rye",
            author: "J.D. Salinger",
            date: "1951",
        },
        { name: "The Hobbit", author: "J.R.R. Tolkien", date: "1937" },
        { name: "Fahrenheit 451", author: "Ray Bradbury", date: "1953" },
        { name: "The Lord of the Rings", author: "J.R.R. Tolkien", date: "1954" },
        { name: "Emma", author: "Jane Austen", date: "1815" },
        { name: "The Silmarillion", author: "J.R.R. Tolkien", date: "1977" },
    ] as Book[]);
}
