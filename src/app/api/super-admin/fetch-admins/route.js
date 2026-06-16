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

         const admins = await User.find({role:"admin"});

         if(!admins) {
            return NextResponse.json({message:"No admins found"}, {status:404});
         }

        //  Decrypting passwords
        
         const formatedAdmins = admins.map(admin => ({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt
         }));
        //  console.log("Admins fetched successfully:", formatedAdmins); 
            return NextResponse.json({admins: formatedAdmins}, {status:200});
     } catch (error) {
        console.log("Error fetching admins:", error);
        return NextResponse.json({message:"Error fetching admins"}, {status:500});
     }
}