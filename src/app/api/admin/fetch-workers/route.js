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

          const search = searchParams.get("search");
          const filter = searchParams.get("filter");

        //   console.log("search: ", search, " filter: ", filter);

          const currentAdmin = await getCurrentAdmin();

          if(!currentAdmin){
              return NextResponse.json({message:"Unauthorized"},{status:401});
          }


        // get admin existence
          const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

          if(!adminExists){
              return NextResponse.json({message:"Admin not found"},{status:404});
          }

          const workers = await Worker.find({      
                    adminId: currentAdmin.adminId,
                    ...(search && {
                        $or: [
                        { name: { $regex: search, $options: "i" } },
                        { mobile: { $regex: search } },
                        ],
                    }),
                    ...(filter !== "All" && {
                        workerType: filter,
                    }),
                }).sort({joiningDate:-1});

            if (workers.length === 0) {
                 return NextResponse.json({ workers }, { status: 200 });
                }

         // calculate total worker attendance for each worker
          
       
     

        const [attendanceCounts, paymentCounts] = await Promise.all([
            Attendance.aggregate([
                {
                    $match: {
                        adminId: new mongoose.Types.ObjectId(currentAdmin.adminId),
                        workerId: { $in: workers.map(worker => worker._id) },
                    },
                },
                {
                    $group: {
                        _id: "$workerId",
                        totalPresent: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
                            },
                        },
                        totalAbsent: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Absent"] }, 1, 0],
                            },
                        },
                        totalHalfDay: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Half Day"] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
            Payment.aggregate([
                {
                    $match: {
                        adminId: new mongoose.Types.ObjectId(currentAdmin.adminId),
                        workerId: { $in: workers.map(worker => worker._id) },
                    },
                },
                {
                    $group: {
                        _id: "$workerId",
                        totalPaid: {
                            $sum: "$amount",
                        },
                    },
                },
            ]),
        ]);

        const attendanceMap = new Map();

        attendanceCounts.forEach(record => {
            attendanceMap.set(record._id.toString(), {
                totalPresent: record.totalPresent,
                totalAbsent: record.totalAbsent,
                totalHalfDay: record.totalHalfDay,
            });
        });

       
        const paymentMap = new Map();

        paymentCounts.forEach(record => {
            paymentMap.set(
                record._id.toString(),
                record.totalPaid
            );
        });
            
            const formattedWorkers = workers.map(worker => {

            const attendance =
                attendanceMap.get(worker._id.toString()) || {};

            return {
                ...worker.toObject(),

                totalPresent: attendance.totalPresent || 0,

                totalAbsent: attendance.totalAbsent || 0,

                totalHalfDay: attendance.totalHalfDay || 0,

                totalPaid: paymentMap.get(worker._id.toString()) || 0,
            };
        });
        //   console.log("Formatted Workers: ", formattedWorkers);
                        
           return NextResponse.json({workers:formattedWorkers},{status:200});


      } catch (error) {
          console.log("Error fetching workers: ",error);
          return NextResponse.json({message:"Error fetching workers"},{status:500});
      }
}