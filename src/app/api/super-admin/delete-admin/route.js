import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(request){
    try {
         await dbConnect();
        
         const {email} = await request.json();

        if(!email || email === "undefined"){
            return NextResponse.json({error:"Admin email  is required"},{status:400});
        }


        // delete admin from database
        const deletedAdmin = await User.findOneAndDelete({email:email, role:"admin"});
        if(!deletedAdmin){
            return NextResponse.json({error:"Admin not found"},{status:404});
        }
        return NextResponse.json({message:"Admin deleted successfully"},{status:200});
    } catch (error) {
        console.log("Error deleting admin:", error);
        return NextResponse.json({error:"Error deleting admin"},{status:500});
    }
}