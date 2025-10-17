import Koa from "koa"
import bodyParser from "koa-bodyparser"
import logger from "koa-logger"
import { SignIn } from "./routes/signIn.route"
import jwt from "koa-jwt"
import jsonwebtoken from "jsonwebtoken"
import { createBooksRoutes } from "./routes/book.route"
import Router from "@koa/router"
import dotenv from "dotenv"
import { db } from "./config/knex"
import { SignUp } from "./routes/signUp.route"
import { createUsersRoutes } from "./routes/user.route"
import { createUsersBooksRoutes } from "./routes/userBooks.route"

const app = new Koa()
const router = new Router()
dotenv.config()
const PORT = Number(process.env.PORT)
const SECRET = process.env.SECRET as string
const database = db


app.use(bodyParser())
app.use(logger())

SignUp(database, router)
SignIn(database, router, (userId: string) =>
  jsonwebtoken.sign({ sub: userId }, SECRET, { expiresIn: "7H" })
)

// ===== protected border ======
app.use(
  jwt({ secret: SECRET, passthrough: false })
    .unless({ path: [/^\/sign-up$/, /^\/sign-in$/] })
)

createUsersRoutes(database, router)
createBooksRoutes(database, router)
createUsersBooksRoutes(database, router)

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(PORT, async () => {
    console.log("WORKING....")
}).on("error", err => {
    console.log(err)
})

export default server