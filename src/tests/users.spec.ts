import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import request from "supertest"
import { createUsersRoutes } from "../routes/user.route"
import { UserDaoInterface } from "../interfaces/userDao.interface"

describe("User routes (mocked DAO)", () => {
    function buildApp(daoMock: jest.Mocked<UserDaoInterface>) {
        const app = new Koa()
        const router = new Router()
        app.use(bodyParser())
        createUsersRoutes(daoMock, router)
        app.use(router.routes()).use(router.allowedMethods())
        return app
    }

    const fakeUser = { id: 1, username: "Mock User", email: "mock@email.com", password: "12312412" }
    const userArray = [fakeUser]
    const userBooks = [{ date: "1900", name: "Mock Book", author: "Mock Mocker" }]

    it("should return all users", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn().mockResolvedValue(userArray),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/users")
        expect(res.status).toBe(200)
        expect(res.body).toEqual(userArray)
        expect(daoMock.findAll).toHaveBeenCalled()
    })

    it("should get user by id", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn().mockResolvedValue(fakeUser),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/users/1")
        expect(res.status).toBe(200)
        expect(res.body).toEqual(fakeUser)
        expect(daoMock.findById).toHaveBeenCalledWith(1)
    })

    it("should throw 400 on invalid id (get user)", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/users/abc")
        expect(res.status).toBe(400)
        expect(res.body).toEqual({ error: "id must be a positive integer" })
        expect(daoMock.findById).not.toHaveBeenCalled()
    })

    it("should throw 404 when user not found", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn().mockResolvedValue(undefined),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/users/999")
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: "User not found" })
        expect(daoMock.findById).toHaveBeenCalledWith(999)
    })

    it("should get user books", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn().mockResolvedValue(userBooks),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/user-books/1")
        expect(res.status).toBe(200)
        expect(res.body).toEqual(userBooks)
        expect(daoMock.findUserBooks).toHaveBeenCalledWith(1)
    })

    it("should throw 400 on invalid id (user books)", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/user-books/asd")
        expect(res.status).toBe(400)
        expect(res.body).toEqual({ error: "id must be a positive integer" })
        expect(daoMock.findUserBooks).not.toHaveBeenCalled()
    })

    it("should throw 404 when user has no books or not found", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).get("/user-books/2")
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: "User not found or does not have books" })
        expect(daoMock.findUserBooks).toHaveBeenCalledWith(2)
    })

    it("should create user", async () => {
        const createPayload = { email: "fake@abv.bg", username: "oaoskwss", password: "dsaowksla" }
        const created = [{ id: 2, ...createPayload }]

        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn().mockResolvedValue(created),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).post("/users").send(createPayload)
        expect(res.status).toBe(201)
        expect(res.body).toEqual(created)
        expect(daoMock.create).toHaveBeenCalledWith(createPayload)
    })

    it("should throw 400 on invalid create payload", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).post("/users").send({ foo: "bar" })
        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Invalid payload")
        expect(daoMock.create).not.toHaveBeenCalled()
    })

    it("should update user", async () => {
        const patch = { email: "updated@yu.com" }
        const updatedArray = [{ ...fakeUser, ...patch }]

        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn().mockResolvedValue(updatedArray),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).patch("/users/1").send(patch)
        expect(res.status).toBe(200)
        expect(res.body).toEqual(updatedArray)
        expect(daoMock.update).toHaveBeenCalledWith(1, patch)
    })

    it("should throw 400 on invalid id (update user)", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).patch("/users/asd").send({ email: "x@y.z" })
        expect(res.status).toBe(400)
        expect(res.body).toEqual({ error: "id must be a positive integer" })
        expect(daoMock.update).not.toHaveBeenCalled()
    })

    it("should throw 400 on invalid update payload", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).patch("/users/1").send({ nonsense: true })
        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Invalid payload")
        expect(daoMock.update).not.toHaveBeenCalled()
    })

    it("should throw 404 when updating non-existing user", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn().mockResolvedValue([]),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).patch("/users/999").send({ email: "xaSA@y.zod" })
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: "User not found" })
        expect(daoMock.update).toHaveBeenCalledWith(999, { email: "xaSA@y.zod" })
    })

    it("should throw 400 on invalid id (delete user)", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).delete("/users/asd")
        expect(res.status).toBe(400)
        expect(res.body).toEqual({ error: "id must be a positive integer" })
        expect(daoMock.delete).not.toHaveBeenCalled()
    })

    it("should throw 404 when delete target not found", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn().mockResolvedValue(0),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).delete("/users/2")
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: "User not found" })
        expect(daoMock.delete).toHaveBeenCalledWith(2)
    })

    it("should delete user", async () => {
        const daoMock: jest.Mocked<UserDaoInterface> = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findUserBooks: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn().mockResolvedValue(1),
        }
        const app = buildApp(daoMock)

        const res = await request(app.callback()).delete("/users/1")
        expect(res.status).toBe(204)
        expect(res.text).toBeFalsy()
        expect(daoMock.delete).toHaveBeenCalledWith(1)
    })
})
