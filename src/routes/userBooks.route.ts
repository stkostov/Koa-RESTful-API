// src/http/usersBooks.routes.ts
import Router from "@koa/router"
import { UserBooksDaoInterface } from "../interfaces/userBooksDao.interface"

export function createUsersBooksRoutes(dao: UserBooksDaoInterface, router: Router) {

  router.post("/user/:userId/book/:bookId", async (ctx) => {
    const userId = Number(ctx.params.userId)
    const bookId = Number(ctx.params.bookId)
    if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(bookId) || bookId <= 0) {
      ctx.status = 400
      ctx.body = { error: "userId and bookId must be positive integers" }
      return
    }

    const assigned = await dao.assignBookToUser(userId, bookId)
    if(assigned.length === 0) {
        ctx.status = 409
        ctx.body = { error: "book already exists" }
        return
    }
    ctx.status = 201
    ctx.body = assigned
  })

  router.patch("/user/:userId/book/:bookId", async (ctx) => {
    const bookId = Number(ctx.params.bookId)
    const oldUserId = Number(ctx.params.userId)
    const { newUserId } = ctx.request.body as { newUserId: number }
    if (!Number.isInteger(bookId) || bookId <= 0 || !Number.isInteger(oldUserId!) || oldUserId! <= 0) {
      ctx.status = 400
      ctx.body = { error: "bookId in path and userId in body must be positive integers" }
      return
    }

    const updated = await dao.updateBooksUser(oldUserId!, newUserId, bookId)
    if (!updated) {
      ctx.status = 404
      ctx.body = { error: "Assignment not found for this book" }
      return
    }
    ctx.body = updated
  })

  router.delete("/user/:userId/book/:bookId", async (ctx) => {
    const bookId = Number(ctx.params.bookId)
    const userId = Number(ctx.params.userId)
    if (!Number.isInteger(bookId) || bookId <= 0 || !Number.isInteger(userId!) || userId! <= 0) {
      ctx.status = 400
      ctx.body = { error: "bookId in path and userId in body must be positive integers" }
      return
    }

    const count = await dao.removeBookFromUser(userId, bookId)
    if (count === 0) {
      ctx.status = 404
      ctx.body = { error: "Assignment not found for this book" }
      return
    }
    ctx.status = 204
  })
}
