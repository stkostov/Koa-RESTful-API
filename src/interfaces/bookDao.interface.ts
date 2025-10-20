import { Book } from "../types/book.type";
import { CrudInterface } from "./crud.interface";

export interface BookDaoInterface extends CrudInterface<Book> { }