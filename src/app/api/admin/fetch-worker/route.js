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
           let starts = performance.now();
           const timings = {};
           await dbConnect();
           timings.dbConnect = performance.now() - starts;
           const {searchParams} = new URL(request.url);
           const id = searchParams.get("id");

           if(!id) return NextResponse.json({message:"Bad request"},{status:400});

            starts = performance.now();
           const currentAdmin = await getCurrentAdmin();
           timings.getCurrentAdmin = performance.now() - starts;
    
            if(!currentAdmin){
                return NextResponse.json({message:"Unauthorized"},{status:401});
            }
    
            starts = performance.now();
            // get admin existence
            const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});
            timings.getAdminExists = performance.now() - starts;

            if(!adminExists){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }

           const queryTimings = {};

const timedQuery = async (name, query) => {
  const start = performance.now();
  const result = await query;
  queryTimings[name] = performance.now() - start;
  return result;
};

const [worker, totalPresent, totalHalfDays, paymentResult] =
  await Promise.all([
    timedQuery(
      "workerQuery",
      Worker.findOne({
        _id: id,
        adminId: currentAdmin.adminId,
      }).lean()
    ),

    timedQuery(
      "presentCount",
      Attendance.countDocuments({
        adminId: currentAdmin.adminId,
        workerId: id,
        status: "Present",
      })
    ),

    timedQuery(
      "halfDayCount",
      Attendance.countDocuments({
        adminId: currentAdmin.adminId,
        workerId: id,
        status: "Half Day",
      })
    ),

    timedQuery(
      "paymentAggregation",
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
            totalPaid: { $sum: "$amount" },
          },
        },
      ])
    ),
  ]);

console.log("Individual query timings:", queryTimings);
          

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