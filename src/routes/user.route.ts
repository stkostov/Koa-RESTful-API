// src/http/users.routes.ts
import Router from "@koa/router"
import type { Context } from "koa"
import { SignUpSchema, UpdateUser } from "../validation/signUp.validation"
import { UserDaoInterface } from "../interfaces/userDao.interface"

export function createUsersRoutes(dao: UserDaoInterface, router: Router) {
    router.get("/users", async (ctx) => {
        const rows = await dao.findAll()
        ctx.status = 200
        ctx.body = rows
    })

    router.get("/users/:id", async (ctx) => {
        const id = Number(ctx.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            ctx.status = 400
            ctx.body = { error: "id must be a positive integer" } 
            return
        }

        const user = await dao.findById(id)
        if (!user) { 
            ctx.status = 404 
            ctx.body = { error: "User not found" } 
            return 
        }
        ctx.body = user
    })

    router.get("/user-books/:id", async (ctx: Context) => {
        const id = Number(ctx.params.id)
        if(!Number.isInteger(id) || id <= 0) {
            ctx.status = 400
            ctx.body = { error: "id must be a positive integer" }
            return
        }

        const books = await dao.findUserBooks(id)
        if(books?.length === 0) {
            ctx.status = 404
            ctx.body = { error: "User not found or does not have books" }
            return
        }
        ctx.body = books
    })

    router.post("/users", async (ctx: Context) => {
        const parsed = SignUpSchema.safeParse(ctx.request.body)
        if (!parsed.success) {
            ctx.status = 400
            ctx.body = { error: "Invalid payload", details: parsed.error }
            return
        }

        const payload = parsed.data
        const created = await dao.create(payload)
        ctx.status = 201
        ctx.body = created
    })

    router.patch("/users/:id", async (ctx) => {
        const id = Number(ctx.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            ctx.status = 400 
            ctx.body = { error: "id must be a positive integer" } 
            return
        }

        const parsed = UpdateUser.safeParse(ctx.request.body)
        if (!parsed.success) {
            ctx.status = 400
            ctx.body = { error: "Invalid payload", details: parsed.error }
            return
        }

        const patch = parsed.data
        const updated = await dao.update(id, patch)
        if (updated.length === 0) { 
            ctx.status = 404 
            ctx.body = { error: "User not found" } 
            return 
        }
        ctx.body = updated
    })

    router.delete("/users/:id", async (ctx) => {
        const id = Number(ctx.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            ctx.status = 400 
            ctx.body = { error: "id must be a positive integer" } 
            return
        }

        const count = await dao.delete(id)
        if (count === 0) { 
            ctx.status = 404 
            ctx.body = { error: "User not found" } 
            return 
        }
        ctx.status = 204
    })
}
