import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import request from "supertest"
import { createUsersBooksRoutes } from "../routes/userBooks.route"

describe("UserBooks routes (mocked DAO)", () => {
  function buildApp(daoMock: jest.Mocked<any>) {
    const app = new Koa()
    const router = new Router()
    app.use(bodyParser())
    createUsersBooksRoutes(daoMock, router)
    app.use(router.routes()).use(router.allowedMethods())
    return app
  }

  const assignedArray = [{ user_id: 1, book_id: 2 }]
  const updatedArray = [{ user_id: 5, book_id: 2 }]

  it("should assign a book to user", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn().mockResolvedValue(assignedArray),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).post("/user/1/book/2")
    expect(res.status).toBe(201)
    expect(res.body).toEqual(assignedArray)
    expect(daoMock.assignBookToUser).toHaveBeenCalledWith(1, 2)
  })

  it("should throw 400 on invalid ids for assign", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).post("/user/abc/book/-1")
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "userId and bookId must be positive integers" })
    expect(daoMock.assignBookToUser).not.toHaveBeenCalled()
  })

  it("should throw 409 when assignment already exists", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn().mockResolvedValue([]), 
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).post("/user/1/book/2")
    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: "book already exists" })
    expect(daoMock.assignBookToUser).toHaveBeenCalledWith(1, 2)
  })

  it("should reassign a book to a new user", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn().mockResolvedValue(updatedArray),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback())
      .patch("/user/1/book/2")
      .send({ newUserId: 5 })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(updatedArray)
    expect(daoMock.updateBooksUser).toHaveBeenCalledWith(1, 5, 2)
  })

  it("should throw 400 when ids/body invalid on reassign", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback())
      .patch("/user/-1/book/xyz")
      .send({ newUserId: 0 })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "bookId in path and userId in body must be positive integers",
    })
    expect(daoMock.updateBooksUser).not.toHaveBeenCalled()
  })

  it("should throw 400 when newUserId missing", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).patch("/user/nk/book/2").send({})
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "bookId in path and userId in body must be positive integers",
    })
    expect(daoMock.updateBooksUser).not.toHaveBeenCalled()
  })

  it("should throw 404 when reassign target not found", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn().mockResolvedValue(0),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback())
      .patch("/user/1/book/2")
      .send({ newUserId: 5 })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Assignment not found for this book" })
    expect(daoMock.updateBooksUser).toHaveBeenCalledWith(1, 5, 2)
  })

  it("should throw 400 on invalid ids for delete", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).delete("/user/abc/book/-1")
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "bookId in path and userId in body must be positive integers" })
    expect(daoMock.removeBookFromUser).not.toHaveBeenCalled()
  })

  it("should throw 404 when delete target not found", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn().mockResolvedValue(0),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).delete("/user/1/book/2")
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Assignment not found for this book" })
    expect(daoMock.removeBookFromUser).toHaveBeenCalledWith(1, 2)
  })

  it("should delete assignment", async () => {
    const daoMock: jest.Mocked<any> = {
      assignBookToUser: jest.fn(),
      updateBooksUser: jest.fn(),
      removeBookFromUser: jest.fn().mockResolvedValue(1),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).delete("/user/1/book/2")
    expect(res.status).toBe(204)
    expect(res.text).toBeFalsy()
    expect(daoMock.removeBookFromUser).toHaveBeenCalledWith(1, 2)
  })
})
