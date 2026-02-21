import z from "zod";


export const adminSchema = z.object({
    password:z.string().min(6,"Password must be at least 6 characters long"),
    role:z.enum(["admin"]).default("admin"),
    isActive:z.boolean().default(true)
})