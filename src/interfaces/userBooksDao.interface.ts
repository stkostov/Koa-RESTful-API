import { UserBooks } from "../types/userBooks.type"

export interface UserBooksDaoInterface {
    assignBookToUser(userId: number, bookId: number): Promise<UserBooks[]>
    updateBooksUser(oldUserId: number, newUserId: number, bookId: number): Promise<UserBooks[]>
    removeBookFromUser(userId: number, bookId: number): Promise<number>
}