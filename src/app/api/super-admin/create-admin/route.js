import { dbConnect } from "@/lib/Connections/dbConnect";
import { adminSchema } from "@/lib/validations/admin.schema";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { customAlphabet, nanoid } from "nanoid";

export async function POST(request){
    try {
        await dbConnect();

        const body = await request.json();

        // validate using zod 
        const parseData = adminSchema.safeParse(body);

        if(!parseData.success){
            return NextResponse.json({message:parseData.error},{status:400})
        }

       const parsedData = parseData.data; // guranteed parsed data is available here

       const nanoId = customAlphabet("0123456789", 5); // Generate a nanoid with uppercase letters and numbers")
       const username = parsedData.adminId + nanoId();

       // password hashing
       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(parsedData.password, saltRounds);

        // create new User 

        const newUser = new User({
            username:username,
            email:parsedData.email,
            password:hashedPassword,
            role:parsedData.role,
            isActive:parsedData.isActive
        });

        await newUser.save();

        // console.log("New User Created:", newUser); // Debugging log

        

        return NextResponse.json({message:"Admin created successfully"}, {status:200});
    } catch (error) {
        console.log("Error in  creating Admin:", error);
        return NextResponse.json({message:"Error in Creating Admin"},{status:500});
    }
}
