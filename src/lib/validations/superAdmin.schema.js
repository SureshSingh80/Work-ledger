import z from "zod";


export const superAdminSchema = z.object({
    adminId:z.string().trim().min(3,"username must be at least 3 character long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscore"),
    email:z.string().trim().regex(/^\S+@\S+\.\S+$/, "Please enter a valid email address"),
    password:z.string().trim().min(8,"Password must be at least 8 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be at least 8 characters, atleast one uppercase letter, one lowercase letter, one number and one special character"),
    role:z.enum(["superAdmin"]).default("superAdmin"),
    isActive:z.boolean().default(true)
})  