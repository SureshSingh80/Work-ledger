import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const filter = searchParams.get("filter");

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
        
        // 2. Today's date
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         const tomorrow = new Date(today);
         tomorrow.setDate(tomorrow.getDate() + 1);


      // 3. Fetch attendance only for fetched workers
      const attendance = await Attendance.find({
         adminId: currentAdmin.adminId,

         workerId: {
            $in: workers.map(worker => worker._id),
         },

         attendanceDate: {
            $gte: today,
            $lt: tomorrow,
         },
      }).lean();

      // console.log("Attendance Records: ", attendance);


      // 4. Create lookup map
      const attendanceMap = new Map();

      attendance.forEach(record => {
         attendanceMap.set(
            record.workerId.toString(),
            record
         );
      });


      // 5. Merge data
      const formattedWorkers = workers.map(worker => {

         const todayAttendance =
            attendanceMap.get(worker._id.toString());

         return {

            _id: worker._id,

            name: worker.name,

            mobile: worker.mobile,

            workerType: worker.workerType,

            dailyWage: worker.dailyWage,

            isActive: worker.isActive,

            todayAttendance: todayAttendance
                  ? {
                        status: todayAttendance.status,
                        overtimeHours:
                           todayAttendance.overtimeHours,
                        note: todayAttendance.note,
                        attendanceDate:
                           todayAttendance.attendanceDate,
                  }
                  : null,
         };
      });

      // console.log("Formatted Workers: ", formattedWorkers);

      return NextResponse.json({
         workers: formattedWorkers,
      });

     } catch (error) {
        console.log("Error in fetch attendance workers",error);
        return NextResponse.json({message:"Error in fetch attendance workers"},{status:500});
     }
}