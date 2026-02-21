import z from "zod";


export const userSchema = z.object({
    username:z.string().min(3,"Username must be at least 3 characters long").max(20,"Username must be at most 20 characters long").trim(),
    password:z.string().min(6,"Password must be at least 6 characters long"),
    role:z.enum(["user"]).default("user"),
    isActive:z.boolean().default(true)
})