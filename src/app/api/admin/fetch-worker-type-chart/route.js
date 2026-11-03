import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
        const initialTime = performance.now();
        const timings = {};
        let startTime = performance.now();
        await dbConnect();
        timings.dbConnect = performance.now() - startTime;

        startTime = performance.now();
        const currentAdmin = await getCurrentAdmin();
        timings.getCurrentAdmin = performance.now() - startTime;

        if(!currentAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
        }


            const adminObjectId = new mongoose.Types.ObjectId(currentAdmin.adminId);

           

            startTime = performance.now();

            const [adminExists, workerTypes] = await Promise.all([

                User.exists({
                    _id: currentAdmin.adminId,
                    role: "admin",
                }),

                Worker.aggregate([
                    {
                        $match: {
                            adminId: adminObjectId,
                        },
                    },
                    {
                        $group: {
                            _id: "$workerType",
                            totalWorkers: { $sum: 1 },
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
                ]),
            ]);

            timings.adminAndWorkerTypes = performance.now() - startTime;

            if (!adminExists) {
                return NextResponse.json(
                    { message: "Admin not found" },
                    { status: 404 }
                );
            }

            const totalTime = performance.now() - initialTime;
            timings.totalTime = totalTime;
            console.log("Timings: ", timings);

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