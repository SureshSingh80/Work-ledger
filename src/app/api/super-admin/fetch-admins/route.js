import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { getCurrentSuperAdmin } from "@/utils/superAdmin/getCurrentSuperAdmin";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
         const initialTime = performance.now();
         const timings = {};
         let startTime = performance.now();
         await dbConnect();
         timings.dbConnec = performance.now() - startTime;
          // check authentication 
         
         startTime = performance.now();
         const currentSuperAdmin = await getCurrentSuperAdmin();
         timings.getCurrentSuperAdmin = performance.now() - startTime;

         if(!currentSuperAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
         }

         startTime = performance.now();
         // check superAdmin exists in the database
         const superAdminExists =  await User.exists({_id: currentSuperAdmin.adminId,role: "superAdmin"});

         if(!superAdminExists){
            return NextResponse.json({message:"Super Admin not found"},{status:404});
         }
         timings.superAdminExists = performance.now() - startTime;

         startTime = performance.now();
         const admins = await User.find({role:"admin"}).select("_id  username email role isActive createdAt").lean();
         if(!admins) {
            return NextResponse.json({message:"No admins found"}, {status:404});
         }
         timings.fetchAdmins = performance.now() - startTime;
      
         timings.totalTime = performance.now() - initialTime;
         console.log("Timings for fetching admins:", timings);

        //  console.log("Admins fetched successfully:", formatedAdmins); 
            return NextResponse.json({admins}, {status:200});
     } catch (error) {
        console.log("Error fetching admins:", error);
        return NextResponse.json({message:"Error fetching admins"}, {status:500});
     }
}