import { z } from "zod";

export const usernamevalidation = z
  .string()
  .min(2, "Username must be atleast 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special character");

export const signupSchema = z.object({
  username: usernamevalidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password should be greater than 6 characters" }),
});
