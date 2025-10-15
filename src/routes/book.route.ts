import Router from "@koa/router"
import { Book } from "../types/book.type"
import { CreateBook, UpdateBook } from "../validation/book.validation"

export function createBooksRoutes(router: Router, books: Book[]) {
    router.get("/books", (ctx) => {
        ctx.body = books
    })
    
    router.get("/books/:id", (ctx) => {
        const bookId = ctx.params.id
        if (!bookId) {
            ctx.status = 400
            ctx.body = { error: "Book must be provided to be updated."}
            return 
        }

        ctx.body = books[+bookId]
    })

    router.post("/books", (ctx) => {
        const parsed = CreateBook.safeParse(ctx.request.body);
        if (!parsed.success) {
            ctx.status = 400;
            ctx.body = { error: parsed.error.flatten() };
            return;
        }
        const { name, author, date } = ctx.request.body as Book
        const id = 1 + books.length
        const b = { id, name, date, author }
        books.push(b)
        ctx.status = 201
        ctx.body = b
    })

    router.patch("/books/:id", (ctx) => {
        const bookId = ctx.params.id
        if (!bookId) {
            ctx.status = 400
            ctx.body = { error: "Book must be provided to be updated."}
            return 
        }

        const p = UpdateBook.safeParse(ctx.request.body);
        if (!p.success) { 
            ctx.status = 400
            ctx.body = { error: "Something is wrong" }
            return 
        }


        const idx = books.findIndex((b) => b.id === +bookId)
        if (idx === -1) { 
            ctx.status = 404 
            ctx.body = { error: "Not found" } 
            return 
        }

        books[idx] = { ...books[idx], ...(ctx.request.body as Partial<Book>) } as Book
        ctx.body = books[idx]
    })

    router.delete("/books/:id", (ctx) => {
        const bookId = ctx.params.id
        if (!bookId) {
            ctx.status = 400
            ctx.body = { error: "Book must be provided to be updated."}
            return 
        }

        const idx = books.findIndex((b) => b.id === +bookId)
        if (idx === -1) { 
            ctx.status = 404 
            ctx.body = { error: "Not found" } 
            return 
        }
        
        const [removed] = books.splice(idx, 1)
        ctx.body = removed
    })
}