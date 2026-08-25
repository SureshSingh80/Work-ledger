import { z } from "zod";

export const editablePaymentSchema = z.object({
    paymentId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid payment ID"
    ),
    amount: z.coerce
        .number()
        .positive("Amount must be greater than 0"),

    paymentDate: z
        .string()
        .min(1, "Payment date is required")
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Invalid payment date"
        ),

    paymentMethod: z.enum(
        ["Cash", "UPI", "Bank Transfer", "Cheque"],
        {
            errorMap: () => ({
                message: "Select a valid payment method",
            }),
        }
    ),

    note: z
        .string()
        .max(500, "Note cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),
});