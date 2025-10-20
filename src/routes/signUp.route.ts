import Router from "@koa/router"
import { SignUpSchema } from "../validation/signUp.validation"
import { UserDaoInterface } from "../interfaces/userDao.interface"

export function SignUp(dao: Pick<UserDaoInterface, 'findByEmail' | 'create'>, router: Router) {
    router.post("/sign-up", async (ctx) => {
        try {
            const parsedData = SignUpSchema.safeParse(ctx.request.body)
            if (!parsedData.success) return ctx.body = { error: parsedData.error }
            const user = parsedData.data
            const ifExists = await dao.findByEmail(user.email)
            if (!!ifExists) {
                ctx.status = 409
                ctx.body = { error: "User exists!" }
                return
            }
            
            const response = await dao.create(user)
            ctx.status = 201
            ctx.body = response
        } catch (e) {
            console.log("Sign up aint working..." + e)
        }
    })
}