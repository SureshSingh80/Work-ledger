import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import Payment from "@/models/Payment";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { formatISTDate, getISTMonthRange } from "@/lib/dateUtils";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { generatePaymentHistoryPDF } from "@/utils/admin/generatePaymentHistoryPDF";


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

         // --------------------------------
        // Fetch payment history
        // --------------------------------

        const paymentHistory = await Payment.find({
            adminId: adminObjectId,
            workerId: worker._id,
            paymentDate: {
                $gte: startDate,
                $lt: endDate,
            },
        })
            .sort({
                paymentDate: 1,
            })
            .lean();

        // --------------------------------
        // No data
        // --------------------------------

        if (paymentHistory.length === 0) {
            return NextResponse.json(
                {
                    message:
                        "No payment history found for the selected period.",
                },
                { status: 404 }
            );
        }

        // ========================================
        // EXCEL
        // ========================================

        if (format === "excel") {

            const workbook =
                new ExcelJS.Workbook();

            const worksheet =
                workbook.addWorksheet(
                    "Payment History"
                );

            worksheet.columns = [
                {
                    header: "Worker Name",
                    key: "workerName",
                    width: 25,
                },
                {
                    header: "Worker Type",
                    key: "workerType",
                    width: 20,
                },
                {
                    header: "Payment Date",
                    key: "paymentDate",
                    width: 18,
                },
                {
                    header: "Amount",
                    key: "amount",
                    width: 15,
                },
            ];

          paymentHistory.forEach((payment) => {
                worksheet.addRow({
                    workerName: worker.name,

                    workerType: worker.workerType,

                    paymentDate: formatISTDate(
                        payment.paymentDate
                    ),

                    amount: payment.amount,
                });
            });

            // Header styling
            worksheet.getRow(1).font = {
                bold: true,
            };

            worksheet.getRow(1).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.eachRow(
                (row) => {
                    row.alignment = {
                        vertical: "middle",
                    };
                }
            );

            const excelBuffer =
                await workbook.xlsx.writeBuffer();

            const filename = month
                ? `payment-${worker.name}-${year}-${String(
                      month
                  ).padStart(2, "0")}.xlsx`
                : `payment-${worker.name}-${year}.xlsx`;

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

        // ========================================
        // PDF
        // ========================================

        if (format === "pdf") {

            const pdfBuffer = await generatePaymentHistoryPDF({
                    worker,
                    paymentHistory,
                    year,
                    month,
                });

            const filename = month
                ? `payment-${worker.name}-${year}-${String(
                      month
                  ).padStart(2, "0")}.pdf`
                : `payment-${worker.name}-${year}.pdf`;

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
        console.log("Error in Export payemnt History:", error);
        return NextResponse.json({message:"Internal Server Error"},{status:500});
    }
}