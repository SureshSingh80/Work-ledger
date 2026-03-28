import { dbConnect } from "@/lib/Connections/dbConnect";
import { loginSchema } from "@/lib/validations/login.schema";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"


export async function POST(request){
     try {
         await dbConnect();
         console.log("Admin login request received");
            
         const body  = await request.json();
        //  console.log("Login request body = ",body);

         const parsed = loginSchema.safeParse(body);
        //  console.log("Parsed login data = ",parsed.data);

         if(!parsed.success){
            return NextResponse.json({error:parsed.error}, {status:400});
         }

         const parsedData = parsed.data;

         const admin = await User.findOne({username:parsedData.adminId, role:"admin"});

        //  console.log("Admin found in database = ",admin);

         if(!admin){
            return NextResponse.json({message:"Invalid adminId or password"}, {status:401});
         }

         const isMatched = await bcrypt.compare(parsedData.password, admin.password);

         if(!isMatched){
            return NextResponse.json({message:"Invalid adminId or password"}, {status:401});
         }

         const token = jwt.sign({adminId:admin._id, role:admin.role}, process.env.JWT_SECRET, {expiresIn:"1d"});
            const response = NextResponse.json({message:"Login successful"},{status:200});
                response.cookies.set("adminToken", token, {
                    httpOnly:true, // prevent access to javascript (client-side)
                    // secure:true, // only send cookie over HTTPS
                    sameSite:"lax", // CSRF protection
                    maxAge:60*60*24, // token expires in 1 day
                });
                return response;
     } catch (error) {
         console.log("Error in admin login", error);
          return NextResponse.json({message:"Error in admin Login"}, {status:500});
     }
}