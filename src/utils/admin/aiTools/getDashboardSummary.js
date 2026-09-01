import mongoose from "mongoose";
import Worker from "@/models/Worker";
import Attendance from "@/models/Attendance";
import Payment from "@/models/Payment";

export async function getDashboardSummary(
    adminId,
    {
        period,
        month,
        year,
    }
) {
    const adminObjectId =
        new mongoose.Types.ObjectId(adminId);

    // =====================================
    // 1. Determine Requested Period
    // =====================================

    let startDate = null;
    let endDate = null;
    let periodLabel = "All Time";

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

        const range = getISTMonthRange(
            currentYear,
            currentMonth
        );

        startDate = range.startDate;
        endDate = range.endDate;

        periodLabel = getMonthLabel(
            currentYear,
            currentMonth
        );
    }

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
            getISTMonthRange(year, month);

        startDate = range.startDate;
        endDate = range.endDate;

        periodLabel =
            getMonthLabel(year, month);
    }

    else if (period === "specific_year") {
        if (!year) {
            throw new Error(
                "Year is required"
            );
        }

        startDate =
            createISTDate(year, 1, 1);

        endDate =
            createISTDate(year + 1, 1, 1);

        periodLabel = String(year);
    }

    else if (period !== "all_time") {
        throw new Error(
            "Invalid dashboard period"
        );
    }

    // =====================================
    // 2. Current Workforce Summary
    // =====================================

    const workforceResult = await Worker.aggregate([
            {
                $match: {
                    adminId: adminObjectId,
                },
            },

            {
                $group: {
                    _id: null,

                    totalWorkers: {
                        $sum: 1,
                    },

                    activeWorkers: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$isActive",
                                        true,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    inactiveWorkers: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$isActive",
                                        false,
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

    const workforce =
        workforceResult[0] || {};

    // =====================================
    // 3. Period Attendance Summary
    // =====================================

    const attendanceFilter = {
        adminId: adminObjectId,
    };

    if (startDate && endDate) {
        attendanceFilter.attendanceDate = {
            $gte: startDate,
            $lt: endDate,
        };
    }

    const attendanceResult =
        await Attendance.aggregate([
            {
                $match: attendanceFilter,
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
        ]);

    const attendance =
        attendanceResult[0] || {};

    const totalPresent =
        attendance.totalPresent || 0;

    const totalHalfDay =
        attendance.totalHalfDay || 0;

    const totalAbsent =
        attendance.totalAbsent || 0;

    const workedDays =
        totalPresent +
        totalHalfDay * 0.5;

    // =====================================
    // 4. Period Total Earnings
    // =====================================

    const earningAttendanceMatch = {
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
    };

    const earningAttendancePipeline = [
        {
            $match:
                earningAttendanceMatch,
        },
    ];

    if (startDate && endDate) {
        earningAttendancePipeline.push({
            $match: {
                attendanceDate: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        });
    }

    earningAttendancePipeline.push({
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

    const earningsResult = await Worker.aggregate([
            {
                $match: {
                    adminId: adminObjectId,
                },
            },

            {
                $lookup: {
                    from: "attendances",

                    let: {
                        workerId: "$_id",
                        adminId: "$adminId",
                    },

                    pipeline:
                        earningAttendancePipeline,

                    as: "attendanceStats",
                },
            },

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
                $group: {
                    _id: null,

                    totalEarned: {
                        $sum: "$totalEarned",
                    },
                },
            },
        ]);

    const totalEarned =
        earningsResult[0]?.totalEarned || 0;

    // =====================================
    // 5. Period Total Payment
    // =====================================

    const paymentFilter = {
        adminId: adminObjectId,
    };

    if (startDate && endDate) {
        paymentFilter.paymentDate = {
            $gte: startDate,
            $lt: endDate,
        };
    }

    const paymentResult =
        await Payment.aggregate([
            {
                $match: paymentFilter,
            },

            {
                $group: {
                    _id: null,

                    totalPaid: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const totalPaid =
        paymentResult[0]?.totalPaid || 0;

    // =====================================
    // 6. Current Pending / Advance
    //
    // IMPORTANT:
    // This intentionally uses ALL-TIME
    // attendance + payments.
    // =====================================

    const balanceResult =
        await Worker.aggregate([
            {
                $match: {
                    adminId: adminObjectId,
                },
            },

            // All-time attendance
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

            // All-time payments
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

            // Extract lookup values
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

            // Worked days
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

            // Earned
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

            // Pending:
            // positive = pending
            // negative = advance
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

            // Final overall summary
            {
                $group: {
                    _id: null,

                    netPending: {
                        $sum: "$pending",
                    },

                    pendingWorkersCount: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        "$pending",
                                        0,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    advanceWorkersCount: {
                        $sum: {
                            $cond: [
                                {
                                    $lt: [
                                        "$pending",
                                        0,
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

    const balance =
        balanceResult[0] || {};

    // =====================================
    // 7. Final Response
    // =====================================

    return {
        periodLabel,

        totalWorkers:
            workforce.totalWorkers || 0,

        activeWorkers:
            workforce.activeWorkers || 0,

        inactiveWorkers:
            workforce.inactiveWorkers || 0,

        totalPresent,
        totalHalfDay,
        totalAbsent,
        workedDays,

        totalEarned,
        totalPaid,

        // Current all-time balances
        netPending:
            balance.netPending || 0,

        pendingWorkersCount:
            balance.pendingWorkersCount || 0,

        advanceWorkersCount:
            balance.advanceWorkersCount || 0,
    };
}


// =======================================
// IST Date
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
// Month Label
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