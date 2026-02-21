import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminSchema } from "@/lib/validations/admin.schema";
import { nanoid } from "nanoid";

export async function POST(request){
    try {
        await dbConnect();

        const body = await request.json();

        // validate using zod 
        const parseData = adminSchema.safeParse(body);

        // console.log("Parsed Data:", parseData); // Debugging log

        if(!parseData.success){
            return NextResponse.json({error:parseData.error},{status:400})
        }

        

       const data = parseData.data; // guranteed parsed data is available here
       

       const username = "Admin"+ nanoid(4); // Generate a unique username for admin
    //    console.log("username = ",username);

       // password hashing
       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // create new User 

        const newUser = new User({
            username:username,
            password:hashedPassword,
            role:data.role ,
            isActive:data.isActive
        });

        await newUser.save();

        // console.log("New User Created:", newUser); // Debugging log

        

        return NextResponse.json({message:"Admin created successfully"}, {status:201});
    } catch (error) {
        console.log("Error in  creating admin:", error);
        return NextResponse.json({error:"Error in Creating Admin"},{status:500});
    }
}
