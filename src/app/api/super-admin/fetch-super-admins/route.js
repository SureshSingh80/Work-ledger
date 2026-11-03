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
         timings.dbConnect = performance.now() - startTime;
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
         timings.superAdminExists = performance.now() - startTime;

         if(!superAdminExists){
            return NextResponse.json({message:"Super Admin not found"},{status:404});
         }

         startTime = performance.now();
         const superAdmins = await User.find({role:"superAdmin"}).select("_id username email role isActive createdAt").lean();
         timings.fetchSuperAdmins = performance.now() - startTime;

         if(!superAdmins ){ 
            return NextResponse.json({message:"No super admins found"}, {status:404});
         }

       
         timings.totalTime = performance.now() - initialTime;
         console.log("Timings for fetching super admins:", timings);
         
            return NextResponse.json({superAdmins}, {status:200});
     } catch (error) {
        console.log("Error fetching super admins:", error);
        return NextResponse.json({message:"Error fetching super admins"}, {status:500});
     }
}