import mongoose from "mongoose";
import Worker from "@/models/Worker";
import Payment from "@/models/Payment";

export async function getWorkerPaymentSummary(
    adminId,
    workerName,
    { period, month, year }
) {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    // -----------------------------------
    // Find Worker
    // -----------------------------------

    const worker = await Worker.findOne({
        adminId: adminObjectId,

        name: {
            $regex: `^${escapeRegex(workerName)}$`,
            $options: "i",
        },
    })
        .select("_id name")
        .lean();

    // Worker itself doesn't exist
    if (!worker) {
        return null;
    }

    // -----------------------------------
    // Payment Filter
    // -----------------------------------

    const filter = {
        adminId: adminObjectId,
        workerId: worker._id,
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

        filter.paymentDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel = getMonthLabel(
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

        if (
            month < 1 ||
            month > 12
        ) {
            throw new Error(
                "Invalid month"
            );
        }

        const { startDate, endDate } =
            getISTMonthRange(
                year,
                month
            );

        filter.paymentDate = {
            $gte: startDate,
            $lt: endDate,
        };

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

        filter.paymentDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel = String(year);
    }

    // -----------------------------------
    // All Time
    // -----------------------------------

    else if (period !== "all_time") {
        throw new Error(
            "Invalid payment period"
        );
    }

    // -----------------------------------
    // Payment Aggregation
    // -----------------------------------

    const result =
        await Payment.aggregate([
            {
                $match: filter,
            },

            {
                $group: {
                    _id: null,

                    totalPaid: {
                        $sum: "$amount",
                    },

                    totalTransactions: {
                        $sum: 1,
                    },
                },
            },
        ]);

    // -----------------------------------
    // Result
    // -----------------------------------

    return {
        workerName: worker.name,

        totalPaid:
            result[0]?.totalPaid || 0,

        totalTransactions:
            result[0]?.totalTransactions || 0,

        periodLabel,
    };
}


// =======================================
// IST Date Helpers
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


// =======================================
// Regex Safety
// =======================================

function escapeRegex(value) {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}