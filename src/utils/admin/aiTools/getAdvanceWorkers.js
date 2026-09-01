import mongoose from "mongoose";
import Worker from "@/models/Worker";

export async function getAdvanceWorkers(
    adminId,
    {
        limit,
        sort = "highest_advance",
    } = {}
) {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const sortOrder = sort === "lowest_advance" ? 1 : -1;

    const pipeline = [
        // -----------------------------------
        // Get Current Admin's Workers
        // -----------------------------------
        {
            $match: {
                adminId: adminObjectId,
            },
        },

        // -----------------------------------
        // Attendance
        // -----------------------------------
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

        // -----------------------------------
        // Payments
        // -----------------------------------
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

        // -----------------------------------
        // Extract Calculated Values
        // -----------------------------------
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

        // -----------------------------------
        // Worked Days
        // -----------------------------------
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

        // -----------------------------------
        // Total Earned
        // -----------------------------------
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

        // -----------------------------------
        // Advance
        // totalPaid - totalEarned
        // -----------------------------------
        {
            $addFields: {
                advance: {
                    $subtract: [
                        "$totalPaid",
                        "$totalEarned",
                    ],
                },
            },
        },

        // -----------------------------------
        // Only Advance Workers
        // -----------------------------------
        {
            $match: {
                advance: {
                    $gt: 0,
                },
            },
        },

        // -----------------------------------
        // Highest / Lowest Advance
        // -----------------------------------
        {
            $sort: {
                advance: sortOrder,
            },
        },

        // -----------------------------------
        // Final Fields
        // -----------------------------------
        {
            $project: {
                _id: 1,

                name: 1,

                workerType: 1,

                dailyWage: 1,

                totalPresent: 1,

                totalHalfDay: 1,

                workedDays: 1,

                totalEarned: 1,

                totalPaid: 1,

                advance: 1,
            },
        },
    ];

    // -----------------------------------
    // Optional Limit
    // -----------------------------------

    if (
        Number.isInteger(limit) &&
        limit > 0
    ) {
        pipeline.push({
            $limit: limit,
        });
    }

    return await Worker.aggregate(pipeline);
}