import zod from "zod";

export const CreateBook = zod.object({
    name: zod.string().min(1),
    author: zod.string().min(1),
    date: zod.string().optional(),
});

export const UpdateBook = CreateBook.partial().strict()