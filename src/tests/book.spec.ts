import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import request from "supertest"
import { createBooksRoutes } from "../routes/book.route"
import type { Book } from "../types/book.type"
import { BookDaoInterface } from "../interfaces/bookDao.interface"

describe("Book routes (mocked DAO)", () => {
  function buildApp(daoMock: jest.Mocked<BookDaoInterface>) {
    const app = new Koa()
    const router = new Router()
    app.use(bodyParser())
    createBooksRoutes(daoMock, router)
    app.use(router.routes()).use(router.allowedMethods())
    return app
  }

  const fakeBook: Book = { id: 1, name: "Mock Book", date: "1900", author: "Mock Mocker" }
  const createPayload = { name: "New Book", date: "2024", author: "Author" }
  const updatedArray = [{ id: 1, name: "Mock Book", date: "2000", author: "Mock Mocker" }]

  it("should return all books", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn().mockResolvedValue([fakeBook]),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).get("/books")
    expect(res.status).toBe(200)
    expect(res.body).toEqual([fakeBook])
    expect(daoMock.findAll).toHaveBeenCalled()
  })

  it("should get a book by id", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(fakeBook),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).get("/books/1")
    expect(res.status).toBe(200)
    expect(res.body).toEqual(fakeBook)
    expect(daoMock.findById).toHaveBeenCalledWith(1)
  })

  it("should get error on wrong id (get book)", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).get("/books/asd")
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "id must be a positive integer" })
    expect(daoMock.findById).not.toHaveBeenCalled()
  })

  it("should 404 when book not found (get by id)", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).get("/books/999")
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Book not found" })
    expect(daoMock.findById).toHaveBeenCalledWith(999)
  })

  it("should create a book", async () => {
    const created = [{ id: 2, ...createPayload }]
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn().mockResolvedValue(created),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).post("/books").send(createPayload)
    expect(res.status).toBe(201)
    expect(res.body).toEqual(created)
    expect(daoMock.create).toHaveBeenCalledWith(createPayload)
  })

  it("should 400 on invalid create payload", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).post("/books").send({ foo: "bar" })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Invalid payload")
    expect(daoMock.create).not.toHaveBeenCalled()
  })

  it("should update a book", async () => {
    const patch = { date: "2000" }
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue(updatedArray),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).patch("/books/1").send(patch)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(updatedArray)
    expect(daoMock.update).toHaveBeenCalledWith(1, patch)
  })

  it("should 400 on wrong id (update book)", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).patch("/books/asd").send({ date: "2000" })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "id must be a positive integer" })
    expect(daoMock.update).not.toHaveBeenCalled()
  })

  it("should 400 on invalid update payload", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).patch("/books/1").send({ nonsense: true })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Invalid payload")
    expect(daoMock.update).not.toHaveBeenCalled()
  })

  it("should 404 when updating non-existing book", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).patch("/books/999").send({ date: "1999" })
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Book not found" })
    expect(daoMock.update).toHaveBeenCalledWith(999, { date: "1999" })
  })

  it("should 400 on wrong id (delete book)", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).delete("/books/asd")
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "id must be a positive integer" })
    expect(daoMock.delete).not.toHaveBeenCalled()
  })

  it("should 404 on delete when book not found", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(0)
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).delete("/books/2")
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Book not found" })
    expect(daoMock.delete).toHaveBeenCalledWith(2)
  })

  it("should delete a book", async () => {
    const daoMock: jest.Mocked<BookDaoInterface> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(1)
    }
    const app = buildApp(daoMock)

    const res = await request(app.callback()).delete("/books/1")
    expect(res.status).toBe(204)
    expect(res.text).toBeFalsy()
    expect(daoMock.delete).toHaveBeenCalledWith(1)
  })
})
