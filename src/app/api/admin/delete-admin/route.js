import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(request){
    try {
         await dbConnect();
        
         const {adminId} = await request.json();

        if(!adminId || adminId === "undefined"){
            return NextResponse.json({error:"Admin ID is required"},{status:400});
        }

        // ✅ ObjectId validation
        if (!mongoose.isValidObjectId(adminId)) {
        return NextResponse.json(
            { error: "Invalid Admin ID format" }, 
            { status: 400 }
        );
        }

        // delete admin from database
        const deletedAdmin = await User.findByIdAndDelete(adminId);
        if(!deletedAdmin){
            return NextResponse.json({error:"Admin not found"},{status:404});
        }
        return NextResponse.json({message:"Admin deleted successfully"},{status:200});
    } catch (error) {
        console.log("Error deleting admin:", error);
        return NextResponse.json({error:"Error deleting admin"},{status:500});
    }
}