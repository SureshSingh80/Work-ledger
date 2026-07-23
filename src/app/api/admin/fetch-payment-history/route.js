import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request){
    try {
         await dbConnect();
         const {searchParams} = new URL(request.url);
         const id = searchParams.get("id");
         const month = searchParams.get("month");

         if(!id) 
            return NextResponse.json({message:"Bad request"},{status:400});

         if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid worker id" },
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


        const attendanceQuery = {
            adminId: new mongoose.Types.ObjectId(currentAdmin.adminId),
            workerId: new mongoose.Types.ObjectId(id),
        };

        const paymentQuery = {
            adminId: new mongoose.Types.ObjectId(currentAdmin.adminId),
            workerId: new mongoose.Types.ObjectId(id),
        };

       
        if (month) {
            const year = new Date().getFullYear();

            const startDate = new Date(year, Number(month) - 1, 1);
            const endDate = new Date(year, Number(month), 1);

            attendanceQuery.attendanceDate = {
                $gte: startDate,
                $lt: endDate,
            };

            paymentQuery.paymentDate = {
                $gte: startDate,
                $lt: endDate,
            };
        }


           const [
                    worker,
                    totalPresent,
                    totalHalfDay,
                    paymentResult,
                    paymentHistory,
                ] = await Promise.all([

                    Worker.findOne({
                        _id: id,
                        adminId: currentAdmin.adminId,
                    })
                    .select("name workerType dailyWage joiningDate")
                    .lean(),

                    Attendance.countDocuments({
                        ...attendanceQuery,
                        status: "Present",
                    }),

                    Attendance.countDocuments({
                        ...attendanceQuery,
                        status: "Half Day",
                    }),

                    Payment.aggregate([
                        {
                            $match: {
                                ...paymentQuery,
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalPaid: { $sum: "$amount" },
                            },
                        },
                    ]),

                    Payment.find(paymentQuery)
                        .sort({ paymentDate: -1 })
                        .lean(),
                ]);

                if (!worker) {
                    return NextResponse.json(
                        { message: "Worker not found" },
                        { status: 404 }
                    );
                }

                const totalPaid = paymentResult[0]?.totalPaid || 0;
            

                const totalEarned =
                    (totalPresent + totalHalfDay * 0.5) * worker.dailyWage;

                const pending = totalEarned - totalPaid;

                return NextResponse.json({
                    worker,

                    summary: {
                        totalPresent,
                        totalHalfDay,
                        totalEarned,
                        totalPaid,
                        pending,
                        transactions: paymentHistory.length,
                    },

                    paymentHistory,
                });



    } catch (error) {
        console.log("Error in fetching payment history",error);
        return NextResponse.json({message:"Error in fetching payment history"},{status:500});
    }
}