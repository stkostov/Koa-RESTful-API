import Router from "@koa/router"
import { SignUpSchema } from "../validation/signUp.validation"
import { User } from "../types/user.type"

export function SignIn(router: Router, users: User[]) {
    router.post("/sign-up", (ctx) => {
        try {
            const parsedData = SignUpSchema.safeParse(ctx.request.body)
            if (!parsedData.success) return ctx.body = { error: parsedData.error }

            const { username, email, password } = parsedData.data
            const id = 1 + users.length

            const userExists = users.find(user => user.email === email)
            if (userExists) {
                ctx.status = 409
                ctx.body = { error: "User exists!" }
                return
            }

            users.push({ id, username, email, password })

            ctx.status = 201
            ctx.body = {
                user: {
                    username,
                    email,
                    password
                }
            }
        } catch (e) {
            console.log("NE BACHKA" + e)
        }
    })
}