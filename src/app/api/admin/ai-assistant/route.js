import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";

import { getTotalPending } from "@/utils/admin/aiTools/getTotalPending";
import { getWorkerSummary } from "@/utils/admin/aiTools/getWorkerSummary";

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

        console.time("Gemini");
        const response = await generateWithRetry(message);
        console.timeEnd("Gemini");


        // Gemini may request a tool
        const functionCall = response.functionCalls?.[0];

        console.log(
            "Requested tool:",
            functionCall?.name
        );

        console.log(
            "Tool arguments:",
            functionCall?.args
        );


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