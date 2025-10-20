import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import request from "supertest"
import { SignUp } from "../routes/signUp.route"
import { UserDaoInterface } from "../interfaces/userDao.interface"

describe("sign-up (mocked DAO)", () => {
    function buildApp(daoMock: jest.Mocked<Pick<UserDaoInterface, 'findByEmail' | 'create'>>) {
        const app = new Koa()
        const router = new Router()
        app.use(bodyParser())
        SignUp(daoMock, router)
        app.use(router.routes()).use(router.allowedMethods())
        return app
    }

    const validPayload = {
        email: "user@example.com",
        username: "validname",
        password: "strongpass",
    }

    it("should return 201 when user is created", async () => {
        const created = [{ id: 1, email: validPayload.email, username: validPayload.username }]
        const daoMock: jest.Mocked<Pick<UserDaoInterface, 'findByEmail' | 'create'>> = {
            findByEmail: jest.fn().mockResolvedValue(undefined),
            create: jest.fn().mockResolvedValue(created),
        }

        const app = buildApp(daoMock)
        const res = await request(app.callback()).post("/sign-up").send(validPayload)

        expect(res.status).toBe(201)
        expect(res.body).toEqual(created)
        expect(daoMock.findByEmail).toHaveBeenCalledWith(validPayload.email)
        expect(daoMock.create).toHaveBeenCalledWith(validPayload)
    })

    it("should throw 409 when email already exists", async () => {
        const existing = { id: 42, email: validPayload.email }
        const daoMock: jest.Mocked<Pick<UserDaoInterface, 'findByEmail' | 'create'>> = {
            findByEmail: jest.fn().mockResolvedValue(existing),
            create: jest.fn(),
        }

        const app = buildApp(daoMock)
        const res = await request(app.callback()).post("/sign-up").send(validPayload)

        expect(res.status).toBe(409)
        expect(res.body).toEqual({ error: "User exists!" })
        expect(daoMock.findByEmail).toHaveBeenCalledWith(validPayload.email)
        expect(daoMock.create).not.toHaveBeenCalled()
    })
})
