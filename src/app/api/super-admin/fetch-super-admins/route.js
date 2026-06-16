import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { getCurrentSuperAdmin } from "@/utils/superAdmin/getCurrentSuperAdmin";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
         await dbConnect();

          // check authentication 
         
         const currentSuperAdmin = await getCurrentSuperAdmin();
   

         if(!currentSuperAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
         }

         // check superAdmin exists in the database
         const superAdminExists =  await User.exists({_id: currentSuperAdmin.adminId,role: "superAdmin"});

         if(!superAdminExists){
            return NextResponse.json({message:"Super Admin not found"},{status:404});
         }

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