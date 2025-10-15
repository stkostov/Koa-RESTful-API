import Router from "@koa/router";
import { User } from "../types/user.type";
import { SignInSchema } from "../validation/signIn.validation";
import { TokenAssigner } from "../types/tokenAssigner.type";

export function SignUp(router: Router, users: User[], tokenAssigner: TokenAssigner) {
    router.post("/sign-in", (ctx) => {
        try {
            const parsedData = SignInSchema.safeParse(ctx.request.body)
            if (!parsedData.success) return ctx.body = { error: parsedData.error }

            const { email, password } = parsedData.data
            const userExists = users.find(user => user.email === email)
            const success = userExists?.password == password
            if (!success) {
                ctx.status = 401
                ctx.body = { error: "Wrong password!" }
                return
            }

            const token = tokenAssigner(String(userExists.id))
            ctx.status = 201
            ctx.body = {
                user: {
                    email,
                    password
                },
                token
            }
        } catch (e) {
            console.log("NE BACHKA" + e)
        }
    })
}