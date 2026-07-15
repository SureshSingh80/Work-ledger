import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
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
                });

         // calculate total worker attendance for each worker
          
        const attendanceCounts = await Attendance.aggregate([
        {
                $match: {
                adminId: new mongoose.Types.ObjectId(currentAdmin.adminId),
                workerId: { $in: workers.map(worker => worker._id) },
                status: "Present",
                },
            },
            {
                $group: {
                _id: "$workerId",
                totalPresent: { $sum: 1 },
                },
            },
        ]);

        const attendanceMap = new Map();

            attendanceCounts.forEach(record => {
                attendanceMap.set(
                    record._id.toString(),
                    record.totalPresent
                );
            });
            
            const formattedWorkers = workers.map(worker => ({
                ...worker.toObject(),

                totalPresent:
                    attendanceMap.get(worker._id.toString()) || 0,
            }));

        //   console.log("Formatted Workers: ", formattedWorkers);
                        
           return NextResponse.json({workers:formattedWorkers},{status:200});


      } catch (error) {
          console.log("Error fetching workers: ",error);
          return NextResponse.json({message:"Error fetching workers"},{status:500});
      }
}