import Koa from "koa"
import bodyParser from "koa-bodyparser"
import logger from "koa-logger"
import { users } from "./data/users.data"
import { SignIn } from "./routes/signUp.route"
import { SignUp } from "./routes/signIn.route"
import jwt from "koa-jwt"
import jsonwebtoken from "jsonwebtoken"
import { createBooksRoutes } from "./routes/book.route"
import { books } from "./data/books.data"
import Router from "@koa/router"

const app = new Koa()
const router = new Router()
const PORT = 4000
const SECRET = "shared-secret"

app.use(bodyParser())
app.use(logger())

SignIn(router, users)
SignUp(router, users, (userId: string) =>
  jsonwebtoken.sign({ sub: userId }, SECRET, { expiresIn: "7H" })
)

// ===== protected border ======
app.use(
  jwt({ secret: SECRET, passthrough: false })
    .unless({ path: [/^\/sign-up$/, /^\/sign-in$/] })
)

createBooksRoutes(router, books)

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(PORT, async () => {
    console.log("WORKING....")
}).on("error", err => {
    console.log(err)
})

export default server