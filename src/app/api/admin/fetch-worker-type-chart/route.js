import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
        await dbConnect();
        const currentAdmin = await getCurrentAdmin();

        
        
            if(!currentAdmin){
                return NextResponse.json({message:"Unauthorized"},{status:401});
            }


        // get admin existence
            const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

            if(!adminExists){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }

            const adminObjectId = new mongoose.Types.ObjectId(currentAdmin.adminId);

            const workerTypes = await Worker.aggregate([
                {
                    $match: {
                        adminId: adminObjectId,
                    },
                },
                {
                    $group: {
                        _id: "$workerType",
                        totalWorkers: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        workerType: "$_id",
                        totalWorkers: 1,
                    },
                },
                {
                    $sort: {
                        totalWorkers: -1,
                    },
                },
            ]);

                return NextResponse.json(
                    {
                        workerTypes,
                    },
                    {
                        status: 200,
                    }
                );

     } catch (error) {
        console.log("Failed to fetch worker type chart: ",error);
        return NextResponse.json({message:"Failed to fetch worker type chart"},{status:500});
     }
}