import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(request){
    try {
         await dbConnect();
        
         const {userId} = await request.json();

        if(!userId || userId === "undefined"){
            return NextResponse.json({error:"User ID is required"},{status:400});
        }

        // ✅ ObjectId validation
        if (!mongoose.isValidObjectId(userId)) {
        return NextResponse.json(
            { error: "Invalid User ID format" }, 
            { status: 400 }
        );
        }

        // delete user from database
        const deletedUser = await User.findByIdAndDelete(userId);
        if(!deletedUser){
            return NextResponse.json({error:"User not found"},{status:404});
        }
        return NextResponse.json({message:"User deleted successfully"},{status:200});
    } catch (error) {
        console.log("Error deleting user:", error);
        return NextResponse.json({error:"Error deleting user"},{status:500});
    }
}