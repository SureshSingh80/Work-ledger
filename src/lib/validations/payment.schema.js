import { z } from "zod";

export const paymentSchema = z.object({

    workerId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid worker id"),

    amount: z.coerce
        .number()
        .positive("Amount must be greater than 0"),

    paymentMethod: z.enum(
        ["Cash", "UPI", "Bank Transfer"],
        {
            errorMap: () => ({
                message: "Select a valid payment method",
            }),
        }
    ),

    selectedDate: z
        .string()
        .trim()
        .min(1, "Payment date is required"),

    note: z
        .string()
        .trim()
        .max(300, "Remark cannot exceed 300 characters")
        .optional()
        .default(""),
});