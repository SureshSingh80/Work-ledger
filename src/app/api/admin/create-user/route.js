import { dbConnect } from "@/lib/Connections/dbConnect";
import { userSchema } from "@/lib/validations/user.schema";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request){
    try {
        await dbConnect();

        const body = await request.json();

        // validate using zod 
        const parseData = userSchema.safeParse(body);

        // console.log("Parsed Data:", parseData); // Debugging log

        if(!parseData.success){
            return NextResponse.json({error:parseData.error},{status:400})
        }

        

       const data = parseData.data; // guranteed parsed data is available here

       // check user already exists
        const existingUser = await User.findOne({username:data.username});

        if(existingUser){
            return NextResponse.json({error:"User already exists"},{status:400});
        }

       // password hashing
       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // create new User 

        const newUser = new User({
            username:data.username,
            password:hashedPassword,
            role:data.role,
            isActive:data.isActive
        });

        await newUser.save();

        // console.log("New User Created:", newUser); // Debugging log

        

        return NextResponse.json({message:"User created successfully"}, {status:201});
    } catch (error) {
        console.log("Error in  creating user:", error);
        return NextResponse.json({error:"Error in Creating User"},{status:500});
    }
}
