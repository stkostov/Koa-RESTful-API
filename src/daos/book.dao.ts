import { Knex } from "knex";
import { Book } from "../types/book.type";

export class BookDao {
    constructor(private db: Knex) {}

    findAll(): Promise<Book[] | undefined> {
        return this.db("books")
    }

    findById(bookId: number): Promise<Book | undefined> {
        return this.db("books").where({ id: bookId }).first()
    }

    create(book: Partial<Book>): Promise<Book[]> {
        return this.db("books").insert(book).returning("*")
    }

    update(bookId: number, book: Partial<Book>): Promise<Book[]> {
        return this.db("books").where({ id: bookId }).update(book).returning("*")
    }

    delete(bookId: number): Promise<number> {
        return this.db("books").where({ id: bookId }).delete()
    }
}