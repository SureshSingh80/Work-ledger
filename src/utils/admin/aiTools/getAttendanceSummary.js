import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export async function getAttendanceSummary(
    adminId,
    { period, month, year }
) {
    const filter = {
        adminId: new mongoose.Types.ObjectId(adminId)
    };

    let periodLabel = "All Time";

    // -----------------------------------
    // This Month
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

        const { startDate, endDate } =
            getISTMonthRange(
                currentYear,
                currentMonth
            );

        filter.attendanceDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel =
            getMonthLabel(
                currentYear,
                currentMonth
            );
    }

    // -----------------------------------
    // Specific Month
    // -----------------------------------

    else if (
        period === "specific_month"
    ) {
        if (!month || !year) {
            throw new Error(
                "Month and year are required"
            );
        }

        const { startDate, endDate } =
            getISTMonthRange(
                year,
                month
            );

        filter.attendanceDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel =
            getMonthLabel(year, month);
    }

    // -----------------------------------
    // Specific Year
    // -----------------------------------

    else if (
        period === "specific_year"
    ) {
        if (!year) {
            throw new Error(
                "Year is required"
            );
        }

        const startDate =
            createISTDate(
                year,
                1,
                1
            );

        const endDate =
            createISTDate(
                year + 1,
                1,
                1
            );

        filter.attendanceDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel = String(year);
    }

    // -----------------------------------
    // All Time
    // -----------------------------------

    else if (
        period !== "all_time"
    ) {
        throw new Error(
            "Invalid attendance period"
        );
    }

    // -----------------------------------
    // Aggregate Attendance
    // -----------------------------------

    const result =
        await Attendance.aggregate([
            {
                $match: filter,
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
        ]);

    const summary =
        result[0] || {};

    return {
        totalPresent:
            summary.totalPresent || 0,

        totalHalfDay:
            summary.totalHalfDay || 0,

        totalAbsent:
            summary.totalAbsent || 0,

        workedDays:
            summary.workedDays || 0,

        periodLabel,
    };
}


// =======================================
// Helpers
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

    let nextMonth =
        month + 1;

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