import zod from "zod";

export const CreateBook = zod.object({
  title: zod.string().min(1),
  author: zod.string().min(1),
  year: zod.number().int().optional(),
});

export const UpdateBook = CreateBook.partial()