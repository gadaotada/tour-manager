import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

type LoginInput = z.infer<typeof loginSchema>;

export { loginSchema, type LoginInput };
