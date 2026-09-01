import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { getAdvanceWorkers } from "@/utils/admin/aiTools/getAdvanceWorkers";
import { getAttendanceSummary } from "@/utils/admin/aiTools/getAttendanceSummary";
import { getDashboardSummary } from "@/utils/admin/aiTools/getDashboardSummary";
import { getPaymentSummary } from "@/utils/admin/aiTools/getPaymentSummary";
import { getPendingWorkers } from "@/utils/admin/aiTools/getPendingWorkers";
import { getTopEarners } from "@/utils/admin/aiTools/getTopEarners";

import { getTotalPending } from "@/utils/admin/aiTools/getTotalPending";
import { getWorkerAttendanceSummary } from "@/utils/admin/aiTools/getWorkerAttendanceSummary";
import { getWorkerPaymentSummary } from "@/utils/admin/aiTools/getWorkerPaymentSummary";
import { getWorkers } from "@/utils/admin/aiTools/getWorkers";
import { getWorkerSummary } from "@/utils/admin/aiTools/getWorkerSummary";
import { getWorkforceSummary } from "@/utils/admin/aiTools/getWorkforceSummary";
import { formatISTDateForInput } from "@/utils/admin/formatISTDateForInput";

import { generateWithRetry } from "@/utils/admin/generateWithRetry";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";

import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        // --------------------------------
        // Database connection
        // --------------------------------

        await dbConnect();

        const { message } =
            await request.json();


        // --------------------------------
        // Validate message
        // --------------------------------

        if (!message?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Message is required",
                },
                {
                    status: 400,
                }
            );
        }


        // --------------------------------
        // Authenticate admin
        // --------------------------------

        const currentAdmin =
            await getCurrentAdmin();

        if (!currentAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }


        // --------------------------------
        // Check admin existence
        // --------------------------------

        const adminExists =
            await User.exists({
                _id: currentAdmin.adminId,
                role: "admin",
            });

        if (!adminExists) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Admin not found",
                },
                {
                    status: 404,
                }
            );
        }


        // --------------------------------
        // Ask Gemini
        // --------------------------------

      
        const response = await generateWithRetry(message);



        // Gemini may request a tool
        const functionCall = response.functionCalls?.[0];

       

        // =================================
        // TOOL 1: TOTAL PENDING
        // =================================

        if (
            functionCall?.name ===
            "get_total_pending"
        ) {
             console.time("MongoDB");
            const totalPending =  await getTotalPending( currentAdmin.adminId);
             console.timeEnd("MongoDB");

            return NextResponse.json(
                {
                    success: true,

                    response:
                        `Your total pending payment is ₹${Number(
                            totalPending
                        ).toLocaleString(
                            "en-IN"
                        )}.`,
                },
                {
                    status: 200,
                }
            );
        }


        // =================================
        // TOOL 2: WORKER SUMMARY
        // =================================

        if (
            functionCall?.name === "get_worker_summary" ) {
                
            const workerName = functionCall.args ?.workerName;

            // Gemini didn't provide worker name
            if (!workerName) {
                return NextResponse.json(
                    {
                        success: false,
                        message:"Worker name is required",
                    },
                    {
                        status: 400,
                    }
                );
            }


            const workerSummary = await getWorkerSummary(currentAdmin.adminId,workerName);


            // Worker doesn't exist
            if (!workerSummary) {
                return NextResponse.json(
                    {
                        success: true,

                        response:
                            `I couldn't find a worker named "${workerName}".`,
                    },
                    {
                        status: 200,
                    }
                );
            }


            // -----------------------------
            // Determine balance status
            // -----------------------------

            const pending =
                Number(
                    workerSummary.pending ||
                    0
                );

            let balanceText;

            if (pending > 0) {
                balanceText =
                    `Pending: ₹${pending.toLocaleString(
                        "en-IN"
                    )}`;
            } else if (pending < 0) {
                balanceText =
                    `Advance: ₹${Math.abs(
                        pending
                    ).toLocaleString(
                        "en-IN"
                    )}`;
            } else {
                balanceText =
                    "No pending or advance amount";
            }


            // -----------------------------
            // Response
            // -----------------------------

            return NextResponse.json(
                {
                    success: true,

                    response:
                        `${workerSummary.name} (${workerSummary.workerType})\n` +
                        `Daily Wage: ₹${Number(
                            workerSummary.dailyWage
                        ).toLocaleString(
                            "en-IN"
                        )}\n` +
                        `Worked Days: ${workerSummary.workedDays}\n` +
                        `Total Earned: ₹${Number(
                            workerSummary.totalEarned
                        ).toLocaleString(
                            "en-IN"
                        )}\n` +
                        `Total Paid: ₹${Number(
                            workerSummary.totalPaid
                        ).toLocaleString(
                            "en-IN"
                        )}\n` +
                        balanceText,
                },
                {
                    status: 200,
                }
            );
        }

        // =================================
        // TOOL 3: PAYMENT SUMMARY
        // =================================

       if (functionCall?.name === "get_payment_summary") {
                const {
                    period,
                    month,
                    year,
                } = functionCall.args || {};

                if (!period) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Payment period is required",
                        },
                        { status: 400 }
                    );
                }

                const paymentSummary = await getPaymentSummary(
                    currentAdmin.adminId,
                    {
                        period,
                        month,
                        year,
                    }
                );

                return NextResponse.json(
                    {
                        success: true,
                        response:
                            `Total Payment: ₹${Number(
                                paymentSummary.totalPaid
                            ).toLocaleString("en-IN")}\n` +
                            `Total Transactions: ${paymentSummary.totalTransactions}\n` +
                            `Period: ${paymentSummary.periodLabel}`,
                    },
                    { status: 200 }
                );
            }

        // =================================
        // TOOL 4: ATTENDANCE SUMMARY
        // =================================

        if (functionCall?.name === "get_attendance_summary") {
                const {
                    period,
                    month,
                    year,
                } = functionCall.args || {};

                if (!period) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Attendance period is required",
                        },
                        { status: 400 }
                    );
                }

                const attendanceSummary = await getAttendanceSummary(
                        currentAdmin.adminId,
                        {
                            period,
                            month,
                            year,
                        }
                    );

                return NextResponse.json(
                    {
                        success: true,

                        response:
                            `Attendance Summary (${attendanceSummary.periodLabel})\n` +
                            `Present: ${attendanceSummary.totalPresent}\n` +
                            `Half Day: ${attendanceSummary.totalHalfDay}\n` +
                            `Absent: ${attendanceSummary.totalAbsent}\n` +
                            `Worked Days: ${attendanceSummary.workedDays}`,
                    },
                    { status: 200 }
                );
            }

        // =================================
        // TOOL 5: PENDING WORKERS
        // =================================

        if (functionCall?.name === "get_pending_workers") {
            const {
                limit = 5,
                sort = "highest_pending",
            } = functionCall.args || {};

            const pendingWorkers = await getPendingWorkers(
                    currentAdmin.adminId,
                    {
                        limit,
                        sort,
                    }
                );

            if (!pendingWorkers.length) {
                return NextResponse.json(
                    {
                        success: true,
                        response:
                            "No workers currently have pending payments.",
                    },
                    { status: 200 }
                );
            }

            const workersText = pendingWorkers
                .map((worker, index) => {
                    return (
                        `${index + 1}. ${worker.name} (${worker.workerType})\n` +
                        `Pending: ₹${Number(
                            worker.pending
                        ).toLocaleString("en-IN")}`
                    );
                })
                .join("\n\n");

            return NextResponse.json(
                {
                    success: true,
                    response:
                        `Pending Workers:\n\n${workersText}`,
                },
                { status: 200 }
            );
        }

        // =================================
        // TOOL 6: WORKER PAYMENT SUMMARY
        // =================================

       if (functionCall?.name === "get_worker_payment_summary") {
            const {
                workerName,
                period,
                month,
                year,
            } = functionCall.args || {};

            if (!workerName) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Worker name is required",
                    },
                    { status: 400 }
                );
            }

            if (!period) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Payment period is required",
                    },
                    { status: 400 }
                );
            }

            const paymentSummary = await getWorkerPaymentSummary(
                    currentAdmin.adminId,
                    workerName,
                    {
                        period,
                        month,
                        year,
                    }
                );

            // Worker not found
            if (!paymentSummary) {
                return NextResponse.json(
                    {
                        success: true,
                        response:
                            `I couldn't find a worker named "${workerName}".`,
                    },
                    { status: 200 }
                );
            }

            return NextResponse.json(
                {
                    success: true,

                    response:
                        `${paymentSummary.workerName} Payment Summary\n` +
                        `Total Paid: ₹${Number(
                            paymentSummary.totalPaid
                        ).toLocaleString("en-IN")}\n` +
                        `Total Transactions: ${paymentSummary.totalTransactions}\n` +
                        `Period: ${paymentSummary.periodLabel}`,
                },
                { status: 200 }
            );
        }

        if (functionCall?.name === "get_worker_attendance_summary") {
            const {
                workerName,
                period,
                month,
                year,
            } = functionCall.args || {};

            if (!workerName) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Worker name is required",
                    },
                    { status: 400 }
                );
            }

            if (!period) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Attendance period is required",
                    },
                    { status: 400 }
                );
            }

            const attendanceSummary = await getWorkerAttendanceSummary(
                    currentAdmin.adminId,
                    workerName,
                    {
                        period,
                        month,
                        year,
                    }
                );

            // Worker itself not found
            if (!attendanceSummary) {
                return NextResponse.json(
                    {
                        success: true,
                        response:
                            `I couldn't find a worker named "${workerName}".`,
                    },
                    { status: 200 }
                );
            }

            return NextResponse.json(
                {
                    success: true,

                    response:
                        `${attendanceSummary.workerName} Attendance Summary\n` +
                        `Period: ${attendanceSummary.periodLabel}\n` +
                        `Present: ${attendanceSummary.totalPresent}\n` +
                        `Half Day: ${attendanceSummary.totalHalfDay}\n` +
                        `Absent: ${attendanceSummary.totalAbsent}\n` +
                        `Worked Days: ${attendanceSummary.workedDays}`,
                },
                { status: 200 }
            );
        }

        if (functionCall?.name === "get_workers") {
            const {
                status = "all",
                workerType,
                limit,
            } = functionCall.args || {};

            const workers = await getWorkers(
                currentAdmin.adminId,
                {
                    status,
                    workerType,
                    limit,
                }
            );

            if (!workers.length) {
                return NextResponse.json(
                    {
                        success: true,
                        response:
                            "No workers found matching your request.",
                    },
                    { status: 200 }
                );
            }

            const workersText = workers
                .map((worker, index) => {
                    return (
                        `${index + 1}. ${worker.name}\n` +
                        `Mobile: ${worker.mobile}\n` +
                        `Type: ${worker.workerType}\n` +
                        `Daily Wage: ₹${Number(
                            worker.dailyWage
                        ).toLocaleString("en-IN")}\n` +
                        `Joining Date: ${formatISTDateForInput(
                            worker.joiningDate
                        )}\n` +
                        `Status: ${
                            worker.isActive
                                ? "Active"
                                : "Inactive"
                        }` +
                        `${
                            worker.address
                                ? `\nAddress: ${worker.address}`
                                : ""
                        }`
                    );
                })
                .join("\n\n");

            return NextResponse.json(
                {
                    success: true,
                    response:
                        `Workers (${workers.length}):\n\n${workersText}`,
                },
                { status: 200 }
            );
        }

        if (functionCall?.name === "get_advance_workers") {
            const {
                limit,
                sort = "highest_advance",
            } = functionCall.args || {};

            const advanceWorkers = await getAdvanceWorkers(
                    currentAdmin.adminId,
                    {
                        limit,
                        sort,
                    }
                );

            if (!advanceWorkers.length) {
                return NextResponse.json(
                    {
                        success: true,
                        response:
                            "No workers currently have advance payments.",
                    },
                    { status: 200 }
                );
            }

            const workersText = advanceWorkers
                .map((worker, index) => {
                    return (
                        `${index + 1}. ${worker.name} (${worker.workerType})\n` +
                        `Advance: ₹${Number(
                            worker.advance
                        ).toLocaleString("en-IN")}`
                    );
                })
                .join("\n\n");

            return NextResponse.json(
                {
                    success: true,
                    response:
                        `Advance Workers:\n\n${workersText}`,
                },
                { status: 200 }
            );
        }

        if (functionCall?.name === "get_top_earners") {
            const {
                period,
                month,
                year,
                limit,
            } = functionCall.args || {};

            if (!period) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Earning period is required",
                    },
                    { status: 400 }
                );
            }

            const topEarners = await getTopEarners(
                currentAdmin.adminId,
                {
                    period,
                    month,
                    year,
                    limit,
                }
            );

            if (!topEarners.length) {
                return NextResponse.json(
                    {
                        success: true,
                        response:
                            "No worker earnings found for the requested period.",
                    },
                    { status: 200 }
                );
            }

            const workersText = topEarners
                .map((worker, index) => {
                    return (
                        `${index + 1}. ${worker.name} (${worker.workerType})\n` +
                        `Worked Days: ${worker.workedDays}\n` +
                        `Daily Wage: ₹${Number(
                            worker.dailyWage
                        ).toLocaleString("en-IN")}\n` +
                        `Total Earned: ₹${Number(
                            worker.totalEarned
                        ).toLocaleString("en-IN")}`
                    );
                })
                .join("\n\n");

            return NextResponse.json(
                {
                    success: true,
                    response:
                        `Top Earners (${topEarners[0].periodLabel}):\n\n` +
                        workersText,
                },
                { status: 200 }
            );
        }

        if (functionCall?.name === "get_workforce_summary") {

            const workforceSummary = await getWorkforceSummary(
                    currentAdmin.adminId
                );

            const typeBreakdown =
                workforceSummary.workerTypes
                    .map(
                        (item) =>
                            `${item.workerType}: ${item.count}`
                    )
                    .join("\n");

            return NextResponse.json(
                {
                    success: true,

                    response:
                        `Workforce Summary\n\n` +
                        `Total Workers: ${workforceSummary.totalWorkers}\n` +
                        `Active Workers: ${workforceSummary.activeWorkers}\n` +
                        `Inactive Workers: ${workforceSummary.inactiveWorkers}\n\n` +
                        `Worker Types:\n${typeBreakdown}`,
                },
                { status: 200 }
            );
        }

        if (functionCall?.name === "get_dashboard_summary") {
            const {
                period,
                month,
                year,
            } = functionCall.args || {};

            if (!period) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Dashboard summary period is required",
                    },
                    { status: 400 }
                );
            }

            const dashboardSummary = await getDashboardSummary(
                    currentAdmin.adminId,
                    {
                        period,
                        month,
                        year,
                    }
                );

            return NextResponse.json(
                {
                    success: true,

                    response:
                        `Dashboard Summary (${dashboardSummary.periodLabel})\n\n` +

                        `Workers\n` +
                        `Total: ${dashboardSummary.totalWorkers}\n` +
                        `Active: ${dashboardSummary.activeWorkers}\n` +
                        `Inactive: ${dashboardSummary.inactiveWorkers}\n\n` +

                        `Attendance\n` +
                        `Present: ${dashboardSummary.totalPresent}\n` +
                        `Half Day: ${dashboardSummary.totalHalfDay}\n` +
                        `Absent: ${dashboardSummary.totalAbsent}\n` +
                        `Worked Days: ${dashboardSummary.workedDays}\n\n` +

                        `Financial\n` +
                        `Earned: ₹${Number(
                            dashboardSummary.totalEarned
                        ).toLocaleString("en-IN")}\n` +

                        `Paid: ₹${Number(
                            dashboardSummary.totalPaid
                        ).toLocaleString("en-IN")}\n` +

                        `Net Pending: ₹${Number(
                            dashboardSummary.netPending
                        ).toLocaleString("en-IN")}\n\n` +

                        `Current Balances\n` +
                        `Workers With Pending: ${dashboardSummary.pendingWorkersCount}\n` +
                        `Workers With Advance: ${dashboardSummary.advanceWorkersCount}`,
                },
                { status: 200 }
            );
        }


        // --------------------------------
        // Gemini requested unknown tool
        // --------------------------------

        if (functionCall) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Requested AI tool is not available.",
                },
                {
                    status: 400,
                }
            );
        }


        // --------------------------------
        // Normal Gemini response
        // --------------------------------

        return NextResponse.json(
            {
                success: true,

                response:
                    response.text ||
                    "I couldn't generate a response.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error(
            "AI Assistant Error:",
            error
        );


        // --------------------------------
        // Gemini overloaded
        // --------------------------------

        if (error?.status === 503) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        "AI service is currently busy. Please try again shortly.",
                },
                {
                    status: 503,
                }
            );
        }


        // --------------------------------
        // Gemini quota exceeded
        // --------------------------------

        if (error?.status === 429) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        "AI usage limit reached. Please try again later.",
                },
                {
                    status: 429,
                }
            );
        }


        // --------------------------------
        // Other errors
        // --------------------------------

        return NextResponse.json(
            {
                success: false,

                message:
                    "Failed to generate AI response",
            },
            {
                status: 500,
            }
        );
    }
}