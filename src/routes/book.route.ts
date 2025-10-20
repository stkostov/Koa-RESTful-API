import Router from "@koa/router"
import type { Book } from "../types/book.type"
import { CreateBook, UpdateBook } from "../validation/book.validation"
import { BookDaoInterface } from "../interfaces/bookDao.interface"

export function createBooksRoutes(dao: BookDaoInterface, router: Router) {

    router.get("/books", async (ctx) => {
        const rows = await dao.findAll()
        ctx.body = rows
    })

    router.get("/books/:id", async (ctx) => {
        const id = Number(ctx.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            ctx.status = 400
            ctx.body = { error: "id must be a positive integer" }
            return
        }

        const book = await dao.findById(id)
        if (!book) {
            ctx.status = 404
            ctx.body = { error: "Book not found" }
            return
        }
        ctx.body = book
    })

    router.post("/books", async (ctx) => {
        const parsed = CreateBook.safeParse(ctx.request.body)
        if (!parsed.success) {
            ctx.status = 400
            ctx.body = { error: "Invalid payload", details: parsed.error }
            return
        }

        const payload = parsed.data as Omit<Book, "id">

        const created = await dao.create(payload)
        ctx.status = 201
        ctx.body = created
    })

    router.patch("/books/:id", async (ctx) => {
        const id = Number(ctx.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            ctx.status = 400
            ctx.body = { error: "id must be a positive integer" }
            return
        }

        const parsed = UpdateBook.safeParse(ctx.request.body)
        if (!parsed.success) {
            ctx.status = 400
            ctx.body = { error: "Invalid payload", details: parsed.error }
            return
        }

        const patch = parsed.data as Partial<Omit<Book, "id">>
        const updated = await dao.update(id, patch)
        if (updated.length === 0) {
            ctx.status = 404
            ctx.body = { error: "Book not found" }
            return
        }
        ctx.body = updated
    })

    router.delete("/books/:id", async (ctx) => {
        const id = Number(ctx.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            ctx.status = 400
            ctx.body = { error: "id must be a positive integer" }
            return
        }

        const count = await dao.delete(id)
        if (count === 0) {
            ctx.status = 404
            ctx.body = { error: "Book not found" }
            return
        }
        ctx.status = 204
    })
}