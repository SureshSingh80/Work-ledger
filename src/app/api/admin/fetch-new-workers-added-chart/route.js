import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request){
    try {
        await dbConnect();
        const {searchParams} = new URL(request.url);

        const year = Number(searchParams.get("year"));

        if (!year || year < 2000 || year > new Date().getFullYear()) {
            return NextResponse.json(
                { message: "Invalid year" },
                { status: 400 }
            );
        }
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

         const monthlyStats = await Worker.aggregate([
                {
                    $match: {
                        adminId: adminObjectId,
                        joiningDate: {
                            $gte: new Date(year, 0, 1),
                            $lt: new Date(year + 1, 0, 1),
                        },
                    },
                },

                {
                    $group: {
                        _id: {
                            $month: "$joiningDate",
                        },
                        totalWorkers: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $project: {
                        _id: 0,
                        month: "$_id",
                        totalWorkers: 1,
                    },
                },

                {
                    $sort: {
                        month: 1,
                    },
                },
            ]);


       const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];

        const newWorkersChart = monthNames.map((monthName, index) => {
            const found = monthlyStats.find(
                (item) => item.month === index + 1
            );

            return {
                month: monthName,
                totalWorkers: found?.totalWorkers || 0,
            };
        });

        // console.log("New Workers Chart Data: ", newWorkersChart);

        return NextResponse.json(
            {
                year,
                newWorkersChart,
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("Error in fetching new workers added chart: ", error);
        return NextResponse.json({ message: "Internal Server Error" },{ status: 500 });
    }
}