import { dbConnect } from "@/lib/Connections/dbConnect";

import User from "@/models/User";
import Worker from "@/models/Worker";

import Attendance from "@/models/Attendance";
import Payment from "@/models/Payment";

import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";

import { generatePendingPaymentsPDF } from "@/utils/admin/generatePendingPaymentsPDF";

import mongoose from "mongoose";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await dbConnect();

        // ----------------------------------------
        // Query parameters
        // ----------------------------------------

        const { searchParams } = new URL(request.url);

        const format = searchParams.get("format");

        const workerType = searchParams.get("workerType") || "All";

        // ----------------------------------------
        // Validate format
        // ----------------------------------------

        if (
            !format ||
            !["excel", "pdf"].includes(format)
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid format",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------
        // Validate worker type
        // ----------------------------------------

        const allowedWorkerTypes = [
            "Rajmistri",
            "Helper",
            "Painter",
            "Electrician",
            "Plumber",
            "Carpenter",
            "Other",
        ];

        if (
            workerType !== "All" &&
            !allowedWorkerTypes.includes(
                workerType
            )
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid worker type",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------
        // Get current admin
        // ----------------------------------------

        const currentAdmin =
            await getCurrentAdmin();

        if (!currentAdmin) {
            return NextResponse.json(
                {
                    message:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        // ----------------------------------------
        // Check admin existence
        // ----------------------------------------

        const adminExists =
            await User.exists({
                _id: currentAdmin.adminId,
                role: "admin",
            });

        if (!adminExists) {
            return NextResponse.json(
                {
                    message:
                        "Admin not found",
                },
                {
                    status: 404,
                }
            );
        }

        const adminObjectId =
            new mongoose.Types.ObjectId(
                currentAdmin.adminId
            );

        // ----------------------------------------
        // Worker match
        // ----------------------------------------

        const workerMatch = {
            adminId: adminObjectId,
        };

        if (workerType !== "All") {
            workerMatch.workerType =
                workerType;
        }

        // =================================================
        // FETCH WORKERS + ATTENDANCE + PAYMENTS
        // =================================================

        const pendingPayments =
            await Worker.aggregate([
                // ----------------------------------------
                // Workers
                // ----------------------------------------

                {
                    $match: workerMatch,
                },

                // ----------------------------------------
                // Attendance statistics
                // ----------------------------------------

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

                // ----------------------------------------
                // Payment statistics
                // ----------------------------------------

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

                // ----------------------------------------
                // Extract lookup results
                // ----------------------------------------

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

                // ----------------------------------------
                // Calculate worked days
                // ----------------------------------------

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

                // ----------------------------------------
                // Calculate total earned
                // ----------------------------------------

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

                // ----------------------------------------
                // Calculate pending / advance
                // ----------------------------------------

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

                // ----------------------------------------
                // Only pending OR advance workers
                // ----------------------------------------

                {
                    $match: {
                        pending: {
                            $ne: 0,
                        },
                    },
                },

                // ----------------------------------------
                // Final consistent response shape
                // ----------------------------------------

                {
                    $project: {
                        _id: 0,

                        workerName: "$name",

                        workerType: 1,

                        dailyWage: 1,

                        joiningDate: 1,

                        totalPresent: 1,

                        totalHalfDay: 1,

                        totalAbsent: 1,

                        workedDays: 1,

                        totalEarned: 1,

                        totalPaid: 1,

                        pending: 1,

                        status: {
                            $cond: [
                                {
                                    $gt: [
                                        "$pending",
                                        0,
                                    ],
                                },
                                "Pending",
                                "Advance",
                            ],
                        },
                    },
                },

                // ----------------------------------------
                // Highest pending first
                // Advances naturally go below
                // ----------------------------------------

                {
                    $sort: {
                        pending: -1,
                    },
                },
            ]);

        // ----------------------------------------
        // No pending / advance data
        // ----------------------------------------

        if (pendingPayments.length === 0) {
            return NextResponse.json(
                {
                    message:
                        "No pending or advance payments found.",
                },
                {
                    status: 404,
                }
            );
        }

        // =================================================
        // EXCEL EXPORT
        // =================================================

        if (format === "excel") {
            const workbook =
                new ExcelJS.Workbook();

            const worksheet =
                workbook.addWorksheet(
                    "Pending Payments"
                );

            // ----------------------------------------
            // Columns
            // ----------------------------------------

            worksheet.columns = [
                {
                    header: "Worker Name",
                    key: "workerName",
                    width: 25,
                },

                {
                    header: "Worker Type",
                    key: "workerType",
                    width: 18,
                },

                {
                    header: "Daily Wage",
                    key: "dailyWage",
                    width: 15,
                },

                {
                    header: "Joining Date",
                    key: "joiningDate",
                    width: 15,
                },

                {
                    header: "Present Days",
                    key: "totalPresent",
                    width: 15,
                },

                {
                    header: "Half Days",
                    key: "totalHalfDay",
                    width: 15,
                },

                {
                    header: "Absent Days",
                    key: "totalAbsent",
                    width: 15,
                },

                {
                    header: "Worked Days",
                    key: "workedDays",
                    width: 15,
                },

                {
                    header: "Total Earned",
                    key: "totalEarned",
                    width: 18,
                },

                {
                    header: "Total Paid",
                    key: "totalPaid",
                    width: 18,
                },

                {
                    header: "Balance",
                    key: "pending",
                    width: 18,
                },

                {
                    header: "Status",
                    key: "status",
                    width: 15,
                },
            ];

            // ----------------------------------------
            // Add rows
            // ----------------------------------------

            pendingPayments.forEach(
                (worker) => {
                    worksheet.addRow({
                        workerName:
                            worker.workerName,

                        workerType:
                            worker.workerType,

                        dailyWage:
                            worker.dailyWage,

                        joiningDate:
                            worker.joiningDate.toLocaleDateString("en-IN"),

                        totalPresent:
                            worker.totalPresent,

                        totalHalfDay:
                            worker.totalHalfDay,

                        totalAbsent:
                            worker.totalAbsent,

                        workedDays:
                            worker.workedDays,

                        totalEarned:
                            worker.totalEarned,

                        totalPaid:
                            worker.totalPaid,

                        pending:
                            worker.pending,

                        status:
                            worker.status,
                    });
                }
            );

            // ----------------------------------------
            // Header styling
            // ----------------------------------------

            const headerRow =
                worksheet.getRow(1);

                

            headerRow.font = {
                bold: true,
            };

            headerRow.alignment = {
                horizontal: "center",
                vertical: "middle",
            };


            // --------------------------------
            // Vertical alignment
            // --------------------------------
            
            worksheet.eachRow((row) => {
                row.height = 22;

                row.eachCell((cell) => {
                    cell.alignment = {
                        ...cell.alignment,
                        vertical: "middle",
                    };
                });
            });

            // ----------------------------------------
            // Cell styling
            // ----------------------------------------
           worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return;

                    row.height = 22;

                    // Text
                    row.getCell(1).alignment = {
                        horizontal: "left",
                        vertical: "middle",
                    };

                    row.getCell(2).alignment = {
                        horizontal: "left",
                        vertical: "middle",
                    };

                    // Daily wage
                    row.getCell(3).alignment = {
                        horizontal: "right",
                        vertical: "middle",
                    };

                    // Joining date
                    row.getCell(4).alignment = {
                        horizontal: "center",
                        vertical: "middle",
                    };

                    // Attendance numbers
                    for (let col = 5; col <= 8; col++) {
                        row.getCell(col).alignment = {
                            horizontal: "center",
                            vertical: "middle",
                        };
                    }

                    // Money
                    for (let col of [9, 10, 11]) {
                        row.getCell(col).alignment = {
                            horizontal: "right",
                            vertical: "middle",
                        };
                    }

                    // Status
                    row.getCell(12).alignment = {
                        horizontal: "center",
                        vertical: "middle",
                    };
                });

            // ----------------------------------------
            // Number formatting
            // ----------------------------------------

            worksheet.eachRow(
                (row, rowNumber) => {
                    if (rowNumber === 1) {
                        return;
                    }

                    row.getCell(3).numFmt =
                        '₹#,##0';

                    row.getCell(8).numFmt =
                        '₹#,##0';

                    row.getCell(9).numFmt =
                        '₹#,##0';

                    row.getCell(10).numFmt =
                        '₹#,##0';
                }
            );

            // ----------------------------------------
            // Generate Excel buffer
            // ----------------------------------------

            const excelBuffer =
                await workbook.xlsx.writeBuffer();

            const filename =
                workerType === "All"
                    ? `pending-payments-${new Date().getFullYear()}.xlsx`
                    : `pending-payments-${workerType}-${new Date().getFullYear()}.xlsx`;

            return new NextResponse(
                excelBuffer,
                {
                    status: 200,

                    headers: {
                        "Content-Type":
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                        "Content-Disposition":
                            `attachment; filename="${filename}"`,

                        "Content-Length":
                            excelBuffer.length.toString(),
                    },
                }
            );
        }

        // =================================================
        // PDF EXPORT
        // =================================================

        if (format === "pdf") {
            const pdfBuffer =await generatePendingPaymentsPDF({
                    pendingPayments,
                    workerType,
                });

            const filename =
                workerType === "All"
                    ? `pending-payments-${new Date().getFullYear()}.pdf`
                    : `pending-payments-${workerType}-${new Date().getFullYear()}.pdf`;

            return new NextResponse(
                pdfBuffer,
                {
                    status: 200,

                    headers: {
                        "Content-Type":
                            "application/pdf",

                        "Content-Disposition":
                            `attachment; filename="${filename}"`,

                        "Content-Length":
                            pdfBuffer.byteLength.toString(),
                    },
                }
            );
        }

    } catch (error) {
        console.error(
            "Error exporting pending payments:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}