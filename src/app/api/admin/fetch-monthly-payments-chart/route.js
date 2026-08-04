import { dbConnect } from "@/lib/Connections/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request){
    try {

        await dbConnect();

        const {searchParams} = new URL(request.url);

        const month = Number(searchParams.get("month"));

            if (!month || month < 1 || month > 12) {
                return NextResponse.json(
                    { message: "Invalid month" },
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

         const year = new Date().getFullYear();
        const startDate = new Date(year, Number(month) - 1, 1);
        const endDate = new Date(year, Number(month), 1);

        const monthlyPayments = await Payment.aggregate([
                    {
                        $match: {
                            adminId: adminObjectId,
                            paymentDate: {
                                $gte: startDate,
                                $lt: endDate,
                            },
                        },
                    },

                    {
                        $group: {
                            _id: "$workerId",
                            totalPaid: {
                                $sum: "$amount",
                            },
                        },
                    },

                    {
                        $lookup: {
                            from: "workers",
                            localField: "_id",
                            foreignField: "_id",
                            as: "worker",
                        },
                    },

                    {
                       $unwind: {
                            path: "$worker",
                            preserveNullAndEmptyArrays: false,
                        },
                    },

                    {
                        $project: {
                            _id: 0,
                            workerId: "$worker._id",
                            workerName: "$worker.name",
                            workerType: "$worker.workerType",
                            totalPaid: 1,
                        },
                    },

                    {
                        $sort: {
                            totalPaid: -1,
                        },
                    },
                ]);

        // console.log("Monthly Payments Chart Data: ", monthlyPayments);
        return NextResponse.json({monthlyPayments},{status:200});


    } catch (error) {
        console.log("Failed to fetch monthly payments chart: ",error);
        return NextResponse.json({message:"Failed to fetch monthly payments chart"},{status:500});
    }
}