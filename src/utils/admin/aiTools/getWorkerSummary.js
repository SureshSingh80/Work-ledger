import mongoose from "mongoose";
import Worker from "@/models/Worker";

export async function getWorkerSummary( adminId, workerName) {
    
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const result = await Worker.aggregate([
        // --------------------------------
        // Find worker
        // --------------------------------
        {
            $match: {
                adminId: adminObjectId,

                name: {
                    $regex: `^${escapeRegex(
                        workerName
                    )}$`,
                    $options: "i",
                },
            },
        },

        // --------------------------------
        // Attendance lookup
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

                            totalAbsent: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$status",
                                                "Absent",
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
        // Payment lookup
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
        // Extract calculated values
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

                totalAbsent: {
                    $ifNull: [
                        {
                            $first:
                                "$attendanceStats.totalAbsent",
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
        // Worked days
        // Present + Half Day × 0.5
        // --------------------------------
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

        // --------------------------------
        // Total earned
        // --------------------------------
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

        // --------------------------------
        // Pending / Advance
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
        // Return only required fields
        // --------------------------------
        {
            $project: {
                _id: 1,

                name: 1,
                mobile: 1,
                address: 1,
                workerType: 1,
                dailyWage: 1,
                joiningDate: 1,
                isActive: 1,

                totalPresent: 1,
                totalHalfDay: 1,
                totalAbsent: 1,

                workedDays: 1,

                totalEarned: 1,
                totalPaid: 1,
                pending: 1,
            },
        },

        // We expect one worker
        {
            $limit: 1,
        },
    ]);

    return result[0] || null;
}


// --------------------------------
// Escape regex special characters
// --------------------------------

function escapeRegex(value) {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}