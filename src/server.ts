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
import { UserDao } from "./daos/user.dao"
import { BookDao } from "./daos/book.dao"
import { UserBooksDao } from "./daos/userBooks.dao"
import { SignUp } from "./routes/signUp.route"
import { createUsersRoutes } from "./routes/user.route"
import { createUsersBooksRoutes } from "./routes/userBooks.route"

const app = new Koa()
const router = new Router()
dotenv.config()
const PORT = Number(process.env.PORT)
const SECRET = process.env.SECRET as string


app.use(bodyParser())
app.use(logger())

SignUp(new UserDao(db), router)
SignIn(new UserDao(db), router, (userId: string) =>
  jsonwebtoken.sign({ sub: userId }, SECRET, { expiresIn: "7H" })
)

// ===== protected border ======
app.use(
  jwt({ secret: SECRET, passthrough: false })
    .unless({ path: [/^\/sign-up$/, /^\/sign-in$/] })
)

createUsersRoutes(new UserDao(db), router)
createBooksRoutes(new BookDao(db), router)
createUsersBooksRoutes(new UserBooksDao(db), router)

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(PORT, async () => {
    console.log("WORKING....")
}).on("error", err => {
    console.log(err)
})

export default server