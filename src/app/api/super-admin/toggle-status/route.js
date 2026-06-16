import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { getCurrentSuperAdmin } from "@/utils/superAdmin/getCurrentSuperAdmin";
import { NextResponse } from "next/server";

export async function PATCH(request){
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

            const {id} = await request.json();
            // console.log("Received ID:", id);

            // marks the admin as active if inactive and vice versa
            const admin = await User.findByIdAndUpdate({ _id: id, role:"admin"},  [{ $set: { isActive: { $not: "$isActive" } } }], { new: true });
            // console.log("Admin found:", admin);
            if(!admin){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }
            return NextResponse.json({message:"Status toggled successfully"},{status:200});
        } catch (error) {
            console.error("Error toggling admin status:", error);
            return NextResponse.json({message:"Failed to toggle status"},{status:500});
        }
}