import { z } from "zod";

import { schemaMessage } from "../../libs/validation";

const loginSchema = z.object({
  username: z.string().trim().min(1, schemaMessage("login.validation.username.required")),
  password: z.string().min(1, schemaMessage("login.validation.password.required")),
});

type LoginInput = z.infer<typeof loginSchema>;

export { loginSchema, type LoginInput };
