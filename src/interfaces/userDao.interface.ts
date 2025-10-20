import { Book } from "../types/book.type";
import { User } from "../types/user.type";
import { CrudInterface } from "./crud.interface";

export interface UserDaoInterface extends CrudInterface<User> {
    findByEmail(email: string): Promise<User | undefined>
    findUserBooks(id: number): Promise<Book[]>
}