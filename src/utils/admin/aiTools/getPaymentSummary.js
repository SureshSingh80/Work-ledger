import Payment from "@/models/Payment";
import mongoose from "mongoose";

export async function getPaymentSummary( adminId, { period, month, year }) {
    const filter = {
        adminId:new mongoose.Types.ObjectId(adminId)
    };

    let periodLabel = "All Time";

    // -----------------------------------
    // This Month
    // -----------------------------------

    if (period === "this_month") {
        const now = new Date();

        // Current date in IST
        const istNow = new Date( now.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
            })
        );

        const currentMonth = istNow.getMonth() + 1;

        const currentYear = istNow.getFullYear();

        const { startDate, endDate } =
            getISTMonthRange(
                currentYear,
                currentMonth
            );

        filter.paymentDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel = new Intl.DateTimeFormat(
            "en-IN",
            {
                month: "long",
                year: "numeric",
            }
        ).format(
            new Date(
                currentYear,
                currentMonth - 1,
                1
            )
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

        const { startDate, endDate } = getISTMonthRange(year, month);

        filter.paymentDate = {
            $gte: startDate,
            $lt: endDate,
        };

        periodLabel = new Intl.DateTimeFormat(
            "en-IN",
            {
                month: "long",
                year: "numeric",
            }
        ).format(
            new Date(year, month - 1, 1)
        );
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

        // Jan 1, 00:00 IST
        const startDate = new Date(
            Date.UTC(
                year - 1,
                11,
                31,
                18,
                30
            )
        );

        // Next Jan 1, 00:00 IST
        const endDate = new Date(
            Date.UTC(
                year,
                11,
                31,
                18,
                30
            )
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
    // Aggregate payments
    // -----------------------------------

    const result = await Payment.aggregate([
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

    return {
        totalPaid:
            result[0]?.totalPaid || 0,

        totalTransactions:
            result[0]?.totalTransactions || 0,

        periodLabel,
    };
}


// =======================================
// IST Month Range
// =======================================

function getISTMonthRange(year, month) {
    /*
        Example:

        August 2026 IST

        Start:
        2026-08-01 00:00 IST
        =
        2026-07-31 18:30 UTC

        End:
        2026-09-01 00:00 IST
        =
        2026-08-31 18:30 UTC
    */

    const startDate = new Date(
        Date.UTC(
            year,
            month - 2,
            31,
            18,
            30
        )
    );

    const endDate = new Date(
        Date.UTC(
            year,
            month - 1,
            31,
            18,
            30
        )
    );

    return {
        startDate,
        endDate,
    };
}