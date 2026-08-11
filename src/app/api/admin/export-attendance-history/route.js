import { dbConnect } from "@/lib/Connections/dbConnect";
import { formatISTDate, getISTMonthRange } from "@/lib/dateUtils";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import   mongoose  from "mongoose";
import { NextResponse } from "next/server";

import ExcelJS from "exceljs";
import { generateAttendancePDF } from "@/utils/admin/generateAttendancePDF";

// import generateAttendancePDF from "@/utils/admin/generateAttendancePDF";

export async function GET(request){
    try {
        await dbConnect();
        const {searchParams} = new URL(request.url);
         const id = searchParams.get("id");
         const month = searchParams.get("month");
         const format = searchParams.get("format");

         if(!id || !format) 
            return NextResponse.json({message:"Bad request"},{status:400});

          if (!["excel", "pdf"].includes(format)) {
            return NextResponse.json(
                { message: "Invalid export format" },
                { status: 400 }
            );
        }

        if (
            month !== null &&
            month !== "" &&
            (
                isNaN(Number(month)) ||
                Number(month) < 1 ||
                Number(month) > 12
            )
        ) {
            return NextResponse.json(
                { message: "Invalid month" },
                { status: 400 }
            );
        }

         const currentAdmin = await getCurrentAdmin();
                 
            if(!currentAdmin){
                return NextResponse.json({message:"Unauthorized"},{status:401});
            }

            // get admin existence
            const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

            if(!adminExists){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }


            const adminObjectId = new mongoose.Types.ObjectId(currentAdmin.adminId);

            const workerObjectId = new mongoose.Types.ObjectId(id);

             const worker = await Worker.findOne({
                _id: workerObjectId,
                adminId: adminObjectId,
            }).lean();

            if (!worker) {
                return NextResponse.json(
                    { message: "Worker not found" },
                    { status: 404 }
                );
            }

        const year = new Date().getFullYear();

        let startDate;
        let endDate;

        if (month) {
            // Selected month
            const range = getISTMonthRange(
                year,
                Number(month)
            );

            startDate = range.startDate;
            endDate = range.endDate;
        } else {
            // Current year
            startDate = new Date(
                Date.UTC(year, 0, 1, -5, -30)
            );

            endDate = new Date(
                Date.UTC(year + 1, 0, 1, -5, -30)
            );
        }

        const attendanceHistory = await Attendance.find({
            adminId: adminObjectId,
            workerId: workerObjectId,

            attendanceDate: {
                $gte: startDate,
                $lt: endDate,
            },
        }).sort({
             attendanceDate: 1,
            })
            .lean();

            if (attendanceHistory.length === 0) {
            return NextResponse.json(
                    {
                    message:
                        "No attendance records found for the selected period.",
                    },
                    { status: 404 }
                );
            }

              // --------------------------------
        // Excel
        // --------------------------------

        if (format === "excel") {
            const workbook = new ExcelJS.Workbook();

            workbook.creator = "Work Ledger";
            workbook.created = new Date();

            const worksheet =
                workbook.addWorksheet("Attendance History");

            // Title
            worksheet.mergeCells("A1:D1");

            worksheet.getCell("A1").value =
                "ATTENDANCE HISTORY";

            worksheet.getCell("A1").font = {
                bold: true,
                size: 16,
            };

            worksheet.getCell("A1").alignment = {
                horizontal: "center",
            };

            // Worker information
            worksheet.mergeCells("A2:D2");

            worksheet.getCell("A2").value =
                `Worker: ${worker.name}`;

            worksheet.getCell("A2").font = {
                bold: true,
            };

            // Period
            worksheet.mergeCells("A3:D3");

            worksheet.getCell("A3").value =
                month
                    ? `Period: ${year}-${String(month).padStart(2, "0")}`
                    : `Period: ${year}`;

            // Empty row
            worksheet.addRow([]);

            // Headers
            const headerRow = worksheet.addRow([
                "Worker",
                "Worker Type",
                "Date",
                "Status",
            ]);

            headerRow.font = {
                bold: true,
            };

            headerRow.alignment = {
                horizontal: "center",
            };

            // Data
            attendanceHistory.forEach((attendance) => {
                worksheet.addRow([
                    worker.name,
                    worker.workerType,
                    formatISTDate(attendance.attendanceDate),
                    attendance.status,
                ]);
            });

            // Date formatting
            worksheet
                .getColumn(3)
                .numFmt = "dd-mm-yyyy";

            // Column widths
            worksheet.getColumn(1).width = 25;
            worksheet.getColumn(2).width = 20;
            worksheet.getColumn(3).width = 18;
            worksheet.getColumn(4).width = 18;

            // Freeze header
            worksheet.views = [
                {
                    state: "frozen",
                    ySplit: 5,
                },
            ];

            // Auto filter
            worksheet.autoFilter = {
                from: "A5",
                to: "D5",
            };

            const buffer =
                await workbook.xlsx.writeBuffer();

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                    "Content-Disposition":
                        `attachment; filename="attendance-${worker.name}-${year}.xlsx"`,

                    "Content-Length":
                        buffer.byteLength.toString(),
                },
            });
        }

         // --------------------------------
        // PDF
        // --------------------------------

        if (format === "pdf") {
            const pdfBuffer = await generateAttendancePDF({
                worker,
                attendanceHistory,
                year,
                month,
            });

            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",

                    "Content-Disposition":
                        `attachment; filename="attendance-${worker.name}-${year}.pdf"`,

                    "Content-Length":
                        pdfBuffer.byteLength.toString(),
                },
            });
        }


    } catch (error) {
        console.log("Error in exporting attendance history", error);
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}