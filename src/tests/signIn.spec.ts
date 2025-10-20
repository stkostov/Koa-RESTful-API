import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import request from "supertest"
import { SignIn } from "../routes/signIn.route"

describe("sign-in (mocked DAO)", () => {
  function buildApp(daoMock: jest.Mocked<any>, tokenAssigner = jest.fn((id: string) => `jwt-${id}`)) {
    const app = new Koa()
    const router = new Router()
    app.use(bodyParser())
    SignIn(daoMock, router, tokenAssigner)
    app.use(router.routes()).use(router.allowedMethods())
    return { app, tokenAssigner }
  }

  const validPayload = { email: "user@example.com", password: "strongpass" }
  const foundUser = { id: 7, email: validPayload.email, username: "user7", password: validPayload.password }

  it("should return 200 when credentials are valid, returns token and public user fields", async () => {
    const daoMock: jest.Mocked<any> = {
      findByEmail: jest.fn().mockResolvedValue(foundUser),
    }

    const { app, tokenAssigner } = buildApp(daoMock)
    const res = await request(app.callback()).post("/sign-in").send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body.user).toEqual(validPayload)
    expect(typeof res.body.token).toBe("string")
    expect(daoMock.findByEmail).toHaveBeenCalledWith(validPayload.email)
    expect(tokenAssigner).toHaveBeenCalledWith("7")
  })

  it("should throw 401 when user not found", async () => {
    const daoMock: jest.Mocked<any> = { findByEmail: jest.fn().mockResolvedValue(undefined) }
    const { app } = buildApp(daoMock)

    const res = await request(app.callback()).post("/sign-in").send(validPayload)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Wrong password!" })
  })

  it("should throw 401 when password is wrong", async () => {
    const daoMock: jest.Mocked<any> = {
      findByEmail: jest.fn().mockResolvedValue({ ...foundUser, password: "different" }),
    }
    const { app } = buildApp(daoMock)

    const res = await request(app.callback()).post("/sign-in").send(validPayload)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Wrong password!" })
  })
})
