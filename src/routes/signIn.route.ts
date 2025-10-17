import Router from "@koa/router";
import { SignInSchema } from "../validation/signIn.validation";
import { TokenAssigner } from "../types/tokenAssigner.type";
import { Knex } from "knex";
import { UserDao } from "../daos/user.dao";

export function SignIn(db:Knex, router: Router, tokenAssigner: TokenAssigner) {
    const dao = new UserDao(db)
    router.post("/sign-in", async (ctx) => {
        try {
            const parsedData = SignInSchema.safeParse(ctx.request.body)
            if (!parsedData.success) return ctx.body = { error: parsedData.error }

            const { email, password } = parsedData.data
            const user = await dao.findByEmail(email)
            const success = user?.password == password
            if (!success) {
                ctx.status = 401
                ctx.body = { error: "Wrong password!" }
                return
            }

            const token = tokenAssigner(String(user.id))
            ctx.status = 201
            ctx.body = {
                user: {
                    email,
                    password
                },
                token
            }
        } catch (e) {
            console.log("sign in aint working..." + e)
        }
    })
}