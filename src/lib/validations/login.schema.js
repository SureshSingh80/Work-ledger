import z from "zod";


export const loginSchema = z.object({
    adminId:z.string().trim().min(3,"adminId must be at least 3 character long").regex(/^[a-zA-Z0-9_]+$/, "AdminId can only contain letters, numbers, and underscore"),
    password:z.string().trim().min(6,"Password must be at least 6 characters long"),
})