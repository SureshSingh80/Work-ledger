import z from "zod";

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^\S+@\S+\.\S+$/, "Please enter a valid email address"),
  newPassword: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters, atleast one uppercase letter, one lowercase letter, one number and one special character",
    ),
    confirmPassword: z
    .string()
    .trim()    .min(8, "Confirm Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Confirm Password must be at least 8 characters, atleast one uppercase letter, one lowercase letter, one number and one special character",
    ),
});
