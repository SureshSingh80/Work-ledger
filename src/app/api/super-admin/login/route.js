import { dbConnect } from "@/lib/Connections/dbConnect";
import { loginSchema } from "@/lib/validations/login.schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import jwt from "jsonwebtoken";


export async function POST(request){
     try {
          await dbConnect();
          const body = await request.json();

          const parsed = loginSchema.safeParse(body);

          if(!parsed.success){
            return NextResponse.json({error:parsed.error}, {status:400});
          }

          const parsedData = parsed.data;
          // console.log("Parsed Login Data = ",parsedData);

          // mathching with adminId and password from database
          const superAdmin = await User.findOne({username:parsedData.adminId, role:"superAdmin"});
          // console.log("superAdmin = ",superAdmin);

          if(!superAdmin){
            return NextResponse.json({message:"Invalid adminId or password"}, {status:401});
          }

          const isMatched = await bcrypt.compare(parsedData.password, superAdmin.password);
         

          if(!isMatched){
            return NextResponse.json({message:"Invalid adminId or password"}, {status:401});
          }

   const token = jwt.sign({adminId:superAdmin._id, role:superAdmin.role}, process.env.JWT_SECRET, {expiresIn:"1d"});

    const response = NextResponse.json({message:"Login successfully"},{status:200});
     response.cookies.set("superAdminToken",token,{
         httpOnly:true, // prevent access to javascript (client-side)   
        //  secure:true,
         sameSite:"lax",
         maxAge:60*60*24, // token expires in 1 day
         path:'/' // cookie will be sent to all routes
     });
     return response;


            
     } catch (error) {
         console.log("Error in super admin login", error);
         return NextResponse.json({message:"Error in super admin login"},{status:500});
     }
}