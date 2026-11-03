import { dbConnect } from "@/lib/Connections/dbConnect";
import { adminSchema } from "@/lib/validations/admin.schema";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { getCurrentSuperAdmin } from "@/utils/superAdmin/getCurrentSuperAdmin";

export async function POST(request){
    try {

        const initialTime = performance.now();
        const timings = {};
        let startTime = performance.now();
        await dbConnect();
        timings.dbConnect = performance.now() - startTime;
        
       // check authentication 

       startTime = performance.now();
       const currentSuperAdmin = await getCurrentSuperAdmin();
       timings.getCurrentSuperAdmin = performance.now() - startTime;
   

        if(!currentSuperAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
        }

        startTime = performance.now();
        //  check superAdmin exists in the database
         const superAdminExists =  await User.exists({_id: currentSuperAdmin.adminId,role: "superAdmin"});

         if(!superAdminExists){
            return NextResponse.json({message:"Super Admin not found"},{status:404});
         }
         timings.superAdminExists = performance.now() - startTime;

       

         const body = await request.json();

        // validate using zod 
        const parseData = adminSchema.safeParse(body);

        if(!parseData.success){
            return NextResponse.json({message:parseData.error},{status:400})
        }

         const parsedData = parseData.data; // guranteed parsed data is available here


         startTime = performance.now();
         // checking email duplicacy 
         const existingAdmin = await User.exists({email: parsedData.email});
         timings.emailExists = performance.now() - startTime;

            if (existingAdmin) {
                return NextResponse.json(
                { message: "Email already exists" },
                { status: 409 }
             );
            }

       const nanoId = customAlphabet("0123456789", 5); // Generate a nanoid with uppercase letters and numbers")
       const username = parsedData.adminId + nanoId();

       // password hashing
       const saltRounds = 10;
       startTime = performance.now();
       const hashedPassword = await bcrypt.hash(parsedData.password, saltRounds);
        timings.hashPassword = performance.now() - startTime;

        // create new User 

        startTime = performance.now();
        const newUser = new User({
            username:username,
            email:parsedData.email,
            password:hashedPassword,
            role:parsedData.role,
            isActive:parsedData.isActive
        });

        try {
            await newUser.save();
            } catch (error) {
            if (error.code === 11000 && error.keyPattern?.email) {
                return NextResponse.json(
                { message: "Email already exists" },
                { status: 409 }
                );
            }

            throw error;
            }

        // console.log("New User Created:", newUser); // Debugging log

        timings.newUserSave = performance.now() - startTime;
        timings.totalTime = performance.now() - initialTime;
        console.log("Timings for creating admin:", timings);

        return NextResponse.json({message:"Admin created successfully"}, {status:201});
    } catch (error) {
        console.log("Error in  creating Admin:", error);
        return NextResponse.json({message:"Error in Creating Admin"},{status:500});
    }
}
