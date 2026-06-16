import z from "zod";

export const workerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Worker name must be at least 3 characters long")
    .max(50, "Worker name cannot exceed 50 characters"),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),

  address: z
    .string()
    .trim()
    .max(200, "Address cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),

  workerType: z
    .enum([
      "Rajmistri",
      "Helper",
      "Painter",
      "Electrician",
      "Plumber",
      "Carpenter",
      "Other",
    ])
    .default("Other"),

  dailyWage: z.coerce
    .number()
    .min(1, "Daily wage must be greater than 0")
    .max(10000, "Daily wage seems too high"),

  joiningDate: z.string().min(1, "Joining date is required"),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),
});
