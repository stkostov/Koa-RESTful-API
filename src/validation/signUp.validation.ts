import zod from "zod";

export const SignUpSchema = zod.object({
    username: zod.string().min(6),
    email: zod.email(),
    password: zod.string().min(6)
})

export const UpdateUser = SignUpSchema.partial().strict()