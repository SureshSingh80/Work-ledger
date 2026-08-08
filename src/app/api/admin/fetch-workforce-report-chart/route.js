import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
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

            const workerSummary = await Worker.aggregate([
                    {
                        $match: {
                        adminId: adminObjectId,
                        },
                    },
                    {
                        $group: {
                        _id: null,

                        totalWorkers: { $sum: 1 },

                        activeWorkers: {
                            $sum: {
                            $cond: ["$isActive", 1, 0],
                            },
                        },

                        inactiveWorkers: {
                            $sum: {
                            $cond: ["$isActive", 0, 1],
                            },
                        },

                        averageDailyWage: {
                            $avg: "$dailyWage",
                        },
                        },
                    },
                ]);

                    // Highest Earner
                    const highestEarner = await Attendance.aggregate([
                       {
                         $match: {
                            adminId: adminObjectId
                         }
                        },

                            {
                                $group: {
                                _id: "$workerId",

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

                            {
                                $addFields: {
                                workedDays: {
                                    $add: [
                                    "$totalPresent",
                                    {
                                        $multiply: ["$totalHalfDay", 0.5],
                                    },
                                    ],
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
                                $addFields: {
                                totalEarned: {
                                    $multiply: [
                                    "$workedDays",
                                    "$worker.dailyWage",
                                    ],
                                },
                                },
                            },

                            {
                                $project: {
                                _id: 0,
                                workerId: "$worker._id",
                                workerName: "$worker.name",
                                workerType: "$worker.workerType",
                                dailyWage: "$worker.dailyWage",
                                workedDays: 1,
                                totalEarned: 1,
                                },
                            },

                        { $sort: { totalEarned: -1 } },
                        { $limit: 1 },
                    ]);

                    // Best Attendance
                    const bestAttendance = await Attendance.aggregate([
                         {
                        $match: {
                            adminId: adminObjectId
                        }
                     },

                            {
                                $group: {
                                    _id: "$workerId",

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

                                    totalAbsent: {
                                        $sum: {
                                            $cond: [
                                                { $eq: ["$status", "Absent"] },
                                                1,
                                                0,
                                            ],
                                        },
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

                                    totalPresent: 1,
                                    totalHalfDay: 1,
                                    totalAbsent: 1,
                                    workedDays: 1,
                                },
                            },

                        { $sort: { totalPresent: -1 } },
                        { $limit: 1 },
                    ]);

                    // Highest Pending
                    const highestPending = await Worker.aggregate([
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

                        { $sort: { pending: -1 } },
                        { $limit: 1 },
                    ]);

                    // Joining Statistics
                    const joiningStats = await Worker.aggregate([
                    {
                        $match: {
                        adminId: adminObjectId,
                        },
                    },
                    {
                        $group: {
                        _id: null,

                        joinedThisYear: {
                            $sum: {
                            $cond: [
                                {
                                $eq: [
                                    { $year: "$joiningDate" },
                                    new Date().getFullYear(),
                                ],
                                },
                                1,
                                0,
                            ],
                            },
                        },

                        joinedThisMonth: {
                            $sum: {
                            $cond: [
                                {
                                $and: [
                                    {
                                    $eq: [
                                        { $year: "$joiningDate" },
                                        new Date().getFullYear(),
                                    ],
                                    },
                                    {
                                    $eq: [
                                        { $month: "$joiningDate" },
                                        new Date().getMonth() + 1,
                                    ],
                                    },
                                ],
                                },
                                1,
                                0,
                            ],
                            },
                        },
                        },
                    },
                ]);

                const financialSummary = await Worker.aggregate([
                    {
                        $match: {
                        adminId: adminObjectId,
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
                            { $multiply: ["$totalHalfDay", 0.5] },
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
                        pending: {
                            $subtract: [
                            {
                                $multiply: [
                                "$workedDays",
                                "$dailyWage",
                                ],
                            },
                            "$totalPaid",
                            ],
                        },
                        },
                    },

                    {
                        $group: {
                        _id: null,

                        totalEarned: {
                            $sum: "$totalEarned",
                        },

                        totalPaid: {
                            $sum: "$totalPaid",
                        },

                        totalPending: {
                            $sum: "$pending",
                        },
                        },
                    },
                    ]);



                    const summary = {
                        ...(workerSummary[0] || {}),
                        ...(financialSummary[0] || {}),
                        };

                    return NextResponse.json(
                    {
                        summary: summary || null,

                        highestEarner: highestEarner[0] || null,

                        bestAttendance: bestAttendance[0] || null,

                        highestPending: highestPending[0] || null,

                        joiningStats: joiningStats[0] || {},
                    },
                    {
                        status: 200,
                    }
                );


    } catch (error) {
        console.log("Failed to fetch workforce report chart: ",error);
        return NextResponse.json({message:"Failed to fetch workforce report chart"},{status:500});
    }
}