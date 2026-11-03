import { dbConnect } from "@/lib/Connections/dbConnect";
import { getISTDayRange } from "@/lib/dateUtils";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";


export async function GET(request){
     try {
         const initialTime = performance.now();
         let startTime = performance.now();
        const timings = {};
        await dbConnect();
        timings.dbConnect = performance.now() - startTime;
        
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const filter = searchParams.get("filter");
        const selectedDate = searchParams.get("date");

      //   console.log("search: ", search, " filter: ", filter, " selectedDate: ", selectedDate);


        startTime = performance.now();
        const currentAdmin = await getCurrentAdmin();
        timings.getCurrentAdmin = performance.now() - startTime;

         if(!currentAdmin){
               return NextResponse.json({message:"Unauthorized"},{status:401});
         }

         startTime = performance.now();
         // get admin existence
         const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});
         timings.getAdminExists = performance.now() - startTime;

         if(!adminExists){
               return NextResponse.json({message:"Admin not found"},{status:404});
         }

         startTime = performance.now();
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
        
         timings.getWorkers = performance.now() - startTime;
         if (workers.length === 0) {
            return NextResponse.json({ workers }, { status: 200 });
         }
       
        

         const { startDate, endDate } = getISTDayRange(selectedDate);

         console.log("selectedDate:", selectedDate);
         // console.log("startDate:", startDate.toISOString());
         // console.log("endDate:", endDate.toISOString());


         startTime = performance.now();
      // 3. Fetch attendance only for fetched workers
      const attendance = await Attendance.find({
         adminId: currentAdmin.adminId,

         workerId: {
            $in: workers.map(worker => worker._id),
         },

         attendanceDate: {
            $gte: startDate,
            $lt: endDate,
         },
      }).lean();

      timings.getAttendance = performance.now() - startTime;

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

            joiningDate: worker.joiningDate,

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

      const endTime = performance.now();
      timings.totalTime = endTime - initialTime;
      
      console.log("Timings:", timings);
      return NextResponse.json({
         workers: formattedWorkers,
      }, { status: 200 });

     } catch (error) {
        console.log("Error in fetch attendance workers",error);
        return NextResponse.json({message:"Error in fetch attendance workers"},{status:500});
     }
}