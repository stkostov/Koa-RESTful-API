import zod from "zod"

export const SignInSchema = zod.union([
    zod.object({
        email: zod.email(),
        password: zod.string().min(6),
    })
])