import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {  superAdminSchema } from "@/lib/validations/superAdmin.schema";
import { customAlphabet, nanoid } from "nanoid";

export async function POST(request){
    try {
        await dbConnect();

        const body = await request.json();

        console.log("body= ",body);



        // validate using zod 
        const parseData = superAdminSchema.safeParse(body);


        if(!parseData.success){
            return NextResponse.json({message:parseData.error},{status:400})
        }

        // console.log("Parsed Data:", parseData); // Debugging log

        

       const parsedData = parseData.data; // guranteed parsed data is available here
       
       const nanoId = customAlphabet("0123456789", 5); // Generate a nanoid with uppercase letters and numbers")
       const username = parsedData.adminId + nanoId(); // Generate a unique username for super admin
    //    console.log("username = ",username);

       // password hashing
       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(parsedData.password, saltRounds);

        // create new User 

        const newUser = new User({
            username:username,
            email:parsedData.email,
            password:hashedPassword,
            role: parsedData.role ,
            isActive: parsedData.isActive
        });

        await newUser.save();

        console.log("New User Created:", newUser); // Debugging log

        

        return NextResponse.json({message:"Super Admin created successfully"}, {status:201});
    } catch (error) {
        console.log("Error in  creating super admins:", error);
        return NextResponse.json({message:"Error in Creating Super Admin"},{status:500});
    }
}
