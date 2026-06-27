import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(request){
     try {
        await dbConnect();
        const currentAdmin = await getCurrentAdmin();
        if(!currentAdmin)
            return NextResponse.json({message:"Unauthorized"},{status:401});
        // get admin existence
        const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

        if(!adminExists){
            return NextResponse.json({message:"Admin not found"},{status:404});
        }

        const {workerId} = await request.json();

        if(!workerId) return NextResponse.json({message:"Bad request"},{status:400});

        if(!mongoose.Types.ObjectId.isValid(workerId)){
        return NextResponse.json(
            { message: "Invalid worker id" },
            { status: 400 }
        );
}

        const deleteWorker = await Worker.findOneAndDelete({_id: workerId, adminId: currentAdmin.adminId}).lean();
        if(!deleteWorker){
            return NextResponse.json({message:"Worker not found"},{status:404});
        }

        return NextResponse.json({message:"Worker deleted successfully"},{status:200});
     } catch (error) {
        console.log("Error deleting worker: ",error);
        return NextResponse.json({message:"Error deleting worker"},{status:500});
     }
}