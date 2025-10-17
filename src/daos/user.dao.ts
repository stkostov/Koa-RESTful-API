// src/daos/user.dao.ts
import type { Knex } from "knex";
import type { User } from "../types/user.type";
import { Book } from "../types/book.type";

export class UserDao {
    constructor(private db: Knex) {}

    findAll(): Promise<User[]> {
        return this.db("users").select("*")
    }

    findById(id: number): Promise<User | undefined> {
        return this.db("users").where({ id }).first()
    }

    findByEmail(email: string): Promise<User | undefined> {
        return this.db("users").where({ email }).first()
    }

    findUserBooks(id: number): Promise<Book[]> {
        return this.db("books")
            .join("users_books", "books.id", "users_books.book_id")
            .where("users_books.user_id", id)
            .select("books.date", "books.name", "books.author")
    }

    create(data: Partial<User>): Promise<User[]> {
        return this.db("users").insert(data).returning("*")
    }

    update(id: number, patch: Partial<Omit<User, "id">>): Promise<User[] | undefined> {
        return this.db("users").where({ id }).update(patch).returning("*")
    }

    delete(id: number): Promise<number> {
        return this.db("users").where({ id }).del()
    }
}
