import mongoose from "mongoose";
import Worker from "@/models/Worker";

export async function getTopEarners(
    adminId,
    {
        period,
        month,
        year,
        limit,
    }
) {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    let periodLabel = "All Time";
    let startDate = null;
    let endDate = null;

    // -----------------------------------
    // Determine Date Range
    // -----------------------------------

    if (period === "this_month") {
        const now = new Date();

        const istNow = new Date(
            now.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
            })
        );

        const currentMonth =
            istNow.getMonth() + 1;

        const currentYear =
            istNow.getFullYear();

        const range =
            getISTMonthRange(
                currentYear,
                currentMonth
            );

        startDate = range.startDate;
        endDate = range.endDate;

        periodLabel =
            getMonthLabel(
                currentYear,
                currentMonth
            );
    }

    // -----------------------------------
    // Specific Month
    // -----------------------------------

    else if (period === "specific_month") {
        if (!month || !year) {
            throw new Error(
                "Month and year are required"
            );
        }

        if (month < 1 || month > 12) {
            throw new Error(
                "Invalid month"
            );
        }

        const range =
            getISTMonthRange(
                year,
                month
            );

        startDate = range.startDate;
        endDate = range.endDate;

        periodLabel =
            getMonthLabel(year, month);
    }

    // -----------------------------------
    // Specific Year
    // -----------------------------------

    else if (period === "specific_year") {
        if (!year) {
            throw new Error(
                "Year is required"
            );
        }

        startDate =
            createISTDate(
                year,
                1,
                1
            );

        endDate =
            createISTDate(
                year + 1,
                1,
                1
            );

        periodLabel = String(year);
    }

    // -----------------------------------
    // All Time
    // -----------------------------------

    else if (period !== "all_time") {
        throw new Error(
            "Invalid earning period"
        );
    }

    // -----------------------------------
    // Attendance Lookup Pipeline
    // -----------------------------------

    const attendancePipeline = [
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
    ];

    // Apply date filtering only when
    // period is not all_time
    if (startDate && endDate) {
        attendancePipeline.push({
            $match: {
                attendanceDate: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        });
    }

    // Count attendance
    attendancePipeline.push({
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
    });

    // -----------------------------------
    // Main Worker Pipeline
    // -----------------------------------

    const pipeline = [
        {
            $match: {
                adminId: adminObjectId,
            },
        },

        // Get attendance for each worker
        {
            $lookup: {
                from: "attendances",

                let: {
                    workerId: "$_id",
                    adminId: "$adminId",
                },

                pipeline:
                    attendancePipeline,

                as: "attendanceStats",
            },
        },

        // -----------------------------------
        // Extract Attendance Counts
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
            },
        },

        // -----------------------------------
        // Calculate Worked Days
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
        // Calculate Earnings
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
        // Only Workers Who Earned Something
        // -----------------------------------

        {
            $match: {
                totalEarned: {
                    $gt: 0,
                },
            },
        },

        // -----------------------------------
        // Highest Earner First
        // -----------------------------------

        {
            $sort: {
                totalEarned: -1,
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

    const workers = await Worker.aggregate(pipeline);

    // Add periodLabel to every worker
    return workers.map((worker) => ({
        ...worker,
        periodLabel,
    }));
}


// =======================================
// IST Date Helper
// =======================================

function createISTDate(
    year,
    month,
    day
) {
    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            0,
            0,
            0
        ) -
        5.5 * 60 * 60 * 1000
    );
}


// =======================================
// IST Month Range
// =======================================

function getISTMonthRange(
    year,
    month
) {
    const startDate =
        createISTDate(
            year,
            month,
            1
        );

    let nextMonth = month + 1;
    let nextYear = year;

    if (nextMonth === 13) {
        nextMonth = 1;
        nextYear++;
    }

    const endDate =
        createISTDate(
            nextYear,
            nextMonth,
            1
        );

    return {
        startDate,
        endDate,
    };
}


// =======================================
// Period Label
// =======================================

function getMonthLabel(
    year,
    month
) {
    return new Intl.DateTimeFormat(
        "en-IN",
        {
            month: "long",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        }
    ).format(
        new Date(
            Date.UTC(
                year,
                month - 1,
                1
            )
        )
    );
}