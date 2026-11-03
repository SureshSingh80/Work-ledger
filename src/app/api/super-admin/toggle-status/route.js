import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { getCurrentSuperAdmin } from "@/utils/superAdmin/getCurrentSuperAdmin";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(request){
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

            const {id} = await request.json();
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: "Invalid admin ID" },
                    { status: 400 }
                );
            }
            // console.log("Received ID:", id);

            startTime = performance.now();
            // marks the admin as active if inactive and vice versa
            const admin = await User.findByIdAndUpdate({ _id: id, role:"admin"},  [{ $set: { isActive: { $not: "$isActive" } } }], { new: true });
            // console.log("Admin found:", admin);
            if(!admin){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }
            timings.findingAndUpdatingAdmin = performance.now() - startTime;

            timings.totalTime = performance.now() - initialTime;
            console.log("Timings for toggling admin/SuperAdmin status:", timings);

            return NextResponse.json({message:"Status toggled successfully"},{status:200});
        } catch (error) {
            console.error("Error toggling admin status:", error);
            return NextResponse.json({message:"Failed to toggle status"},{status:500});
        }
}