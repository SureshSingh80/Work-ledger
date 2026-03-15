import { dbConnect } from "@/lib/Connections/dbConnect";
import { loginSchema } from "@/lib/validations/login.schema";
import { NextResponse } from "next/server";


export async function POST(request){
     try {
         await dbConnect();
            const {username,password} = await request.json();
            console.log(username,password);

            const parsedData = loginSchema.safeParse({username,password});
            console.log(parsedData);

            if(!parsedData.success){
                return NextResponse.json({message:parsedData.error},{status:400})
            }

            return NextResponse.json({message:"Login successful"});
     } catch (error) {
         console.log("Login error:", error);
            return NextResponse.json({message:"Login failed"}, {status:500});
     }
}