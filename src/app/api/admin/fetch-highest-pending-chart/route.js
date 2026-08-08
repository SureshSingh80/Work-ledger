import { dbConnect } from "@/lib/Connections/dbConnect";
import Payment from "@/models/Payment";
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

        const pendingAnalysis = await Worker.aggregate([
                {
                    $match: {
                    adminId: adminObjectId,
                    isActive: true,
                    },
                },

                // Attendance
                {
                    $lookup: {
                    from: "attendances",
                    let: {
                        workerId: "$_id",
                        adminId: "$adminId",
                    },
                    pipeline: [
                        {
                        $match: {
                            $expr: {
                            $and: [
                                { $eq: ["$workerId", "$$workerId"] },
                                { $eq: ["$adminId", "$$adminId"] },
                            ],
                            },
                        },
                        },
                        {
                        $group: {
                            _id: null,

                            totalPresent: {
                            $sum: {
                                $cond: [
                                { $eq: ["$status", "Present"] },
                                1,
                                0,
                                ],
                            },
                            },

                            totalHalfDay: {
                            $sum: {
                                $cond: [
                                { $eq: ["$status", "Half Day"] },
                                1,
                                0,
                                ],
                            },
                            },
                        },
                        },
                    ],
                    as: "attendanceStats",
                    },
                },

                // Payments
                {
                    $lookup: {
                    from: "payments",
                    let: {
                        workerId: "$_id",
                        adminId: "$adminId",
                    },
                    pipeline: [
                        {
                        $match: {
                            $expr: {
                            $and: [
                                { $eq: ["$workerId", "$$workerId"] },
                                { $eq: ["$adminId", "$$adminId"] },
                            ],
                            },
                        },
                        },
                        {
                        $group: {
                            _id: null,
                            totalPaid: {
                            $sum: "$amount",
                            },
                        },
                        },
                    ],
                    as: "paymentStats",
                    },
                },

                {
                    $addFields: {
                    totalPresent: {
                        $ifNull: [
                        { $first: "$attendanceStats.totalPresent" },
                        0,
                        ],
                    },

                    totalHalfDay: {
                        $ifNull: [
                        { $first: "$attendanceStats.totalHalfDay" },
                        0,
                        ],
                    },

                    totalPaid: {
                        $ifNull: [
                        { $first: "$paymentStats.totalPaid" },
                        0,
                        ],
                    },
                    },
                },

                {
                    $addFields: {
                    workedDays: {
                        $add: [
                        "$totalPresent",
                        {
                            $multiply: [
                            "$totalHalfDay",
                            0.5,
                            ],
                        },
                        ],
                    },
                    },
                },

                {
                    $addFields: {
                    totalEarned: {
                        $multiply: [
                        "$workedDays",
                        "$dailyWage",
                        ],
                    },
                    },
                },

                {
                    $addFields: {
                    pending: {
                        $subtract: [
                        "$totalEarned",
                        "$totalPaid",
                        ],
                    },
                    },
                },

                // Hide workers with zero balance
                {
                    $match: {
                    pending: {
                        $ne: 0,
                    },
                    },
                },

                {
                    $project: {
                    _id: 0,
                    workerId: "$_id",
                    workerName: "$name",
                    workerType: 1,
                    workedDays: 1,
                    totalEarned: 1,
                    totalPaid: 1,
                    pending: 1,
                    },
                },

                {
                    $sort: {
                    pending: -1,
                    },
                },
        ]);

        return NextResponse.json({highestPendingData:pendingAnalysis},{status:200});
    } catch (error) {
        console.error("Error fetching highest pending chart:", error);
        return NextResponse.json({message:"Internal Server Error"},{status:500});
    }
}