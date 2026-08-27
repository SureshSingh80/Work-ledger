import mongoose from "mongoose";
import Worker from "@/models/Worker";

export async function getTotalPending(adminId) {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const result = await Worker.aggregate([
        // --------------------------------
        // Only current admin's workers
        // --------------------------------
        {
            $match: {
                adminId: adminObjectId,
            },
        },

        // --------------------------------
        // Attendance
        // --------------------------------
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
                                    {
                                        $eq: [
                                            "$workerId",
                                            "$$workerId",
                                        ],
                                    },
                                    {
                                        $eq: [
                                            "$adminId",
                                            "$$adminId",
                                        ],
                                    },
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
                                        {
                                            $eq: [
                                                "$status",
                                                "Present",
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },

                            totalHalfDay: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$status",
                                                "Half Day",
                                            ],
                                        },
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

        // --------------------------------
        // Payments
        // --------------------------------
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
                                    {
                                        $eq: [
                                            "$workerId",
                                            "$$workerId",
                                        ],
                                    },
                                    {
                                        $eq: [
                                            "$adminId",
                                            "$$adminId",
                                        ],
                                    },
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

        // --------------------------------
        // Extract values
        // --------------------------------
        {
            $addFields: {
                totalPresent: {
                    $ifNull: [
                        {
                            $first:
                                "$attendanceStats.totalPresent",
                        },
                        0,
                    ],
                },

                totalHalfDay: {
                    $ifNull: [
                        {
                            $first:
                                "$attendanceStats.totalHalfDay",
                        },
                        0,
                    ],
                },

                totalPaid: {
                    $ifNull: [
                        {
                            $first:
                                "$paymentStats.totalPaid",
                        },
                        0,
                    ],
                },
            },
        },

        // --------------------------------
        // Calculate total earned
        // --------------------------------
        {
            $addFields: {
                totalEarned: {
                    $multiply: [
                        {
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

                        "$dailyWage",
                    ],
                },
            },
        },

        // --------------------------------
        // Calculate worker pending
        // --------------------------------
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

    


        // --------------------------------
        // Sum pending of all workers
        // --------------------------------
        {
            $group: {
                _id: null,

                totalPending: {
                    $sum: "$pending",
                },
            },
        },
    ]);

    return result[0]?.totalPending || 0;
}