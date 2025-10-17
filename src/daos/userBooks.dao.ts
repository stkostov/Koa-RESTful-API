import { Knex } from "knex";
import { UserBooks } from "../types/userBooks.type";

export class UserBooksDao {
    constructor(private db: Knex) {}

    assignBookToUser(userId: number, bookId: number): Promise<UserBooks[]> {
        return this.db("users_books")
            .insert({ user_id: userId, book_id: bookId })
            .onConflict(["user_id", "book_id"])
            .ignore()
            .returning("*")
    }

    updateBooksUser(oldUserId: number, newUserId: number, bookId: number): Promise<UserBooks[]> {
        return this.db("users_books").where({ user_id: oldUserId, book_id: bookId }).update({ user_id: newUserId }).returning("*")
    }

    removeBookFromUser(userId: number, bookId: number): Promise<number> {
        return this.db("users_books").where({ user_id: userId, book_id: bookId }).delete()
    }
}