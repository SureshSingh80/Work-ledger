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

           if(!id) return NextResponse.json({message:"Bad request"},{status:400});

           const currentAdmin = await getCurrentAdmin();
    
            if(!currentAdmin){
                return NextResponse.json({message:"Unauthorized"},{status:401});
            }
    
            // get admin existence
            const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});
    
            if(!adminExists){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }

            const [worker, totalPresent,totalHalfDays, paymentResult] = await Promise.all([
                    Worker.findOne({
                        _id: id,
                        adminId: currentAdmin.adminId
                    }).lean(),

                    Attendance.countDocuments({
                        adminId: currentAdmin.adminId,
                        workerId: id,
                        status: "Present"
                    }),
                    Attendance.countDocuments({
                        adminId: currentAdmin.adminId,
                        workerId: id,
                        status: "Half Day"
                    }),
                    Payment.aggregate([
                        {
                            $match: {
                                adminId: new mongoose.Types.ObjectId(currentAdmin.adminId),
                                workerId: new mongoose.Types.ObjectId(id),
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
                ]),
                    
            ]);

            const totalPaid = paymentResult[0]?.totalPaid || 0;

            if (!worker) {
                return NextResponse.json(
                    { message: "Worker not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                    {
                        worker,
                        totalPresent,
                        totalHalfDays,
                        totalPaid
                    },
                    {
                        status: 200
                    }
            );
          
     } catch (error) {
          console.log("Error fetching worker: ",error);
          return NextResponse.json({message:"Error fetching worker"},{status:500});
     }
}