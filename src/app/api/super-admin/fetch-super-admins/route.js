import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
         await dbConnect();

         const superAdmins = await User.find({role:"superAdmin"});

         if(!superAdmins ){ 
            return NextResponse.json({message:"No super admins found"}, {status:404});
         }

       
        
         const formatedSuperAdmins = superAdmins.map(superAdmin => ({
            _id: superAdmin._id,
            username: superAdmin.username,
            email: superAdmin.email,
            role: superAdmin.role,
            isActive: superAdmin.isActive,
            createdAt: superAdmin.createdAt
         }));
        
            return NextResponse.json({superAdmins: formatedSuperAdmins}, {status:200});
     } catch (error) {
        console.log("Error fetching super admins:", error);
        return NextResponse.json({message:"Error fetching super admins"}, {status:500});
     }
}