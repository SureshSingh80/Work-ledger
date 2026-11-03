import { dbConnect } from "@/lib/Connections/dbConnect";
import { getISTStartDate } from "@/lib/dateUtils";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function POST(request){
      try {
        const intialTime = performance.now();
        let startTime = performance.now();
        const timings = {};
         await dbConnect();
            timings.dbConnect = performance.now() - startTime;
         const { workerId, status, selectedDate } = await request.json();

         // validate 
        if(!workerId || !status || !selectedDate){
            return NextResponse.json({message:"Worker ID, status, and date are required."},{status:400});
        }

        const allowedStatus = ["Present", "Absent", "Half Day"];

        if (!allowedStatus.includes(status)) {
            return NextResponse.json(
                { message: "Invalid attendance status" },
                { status: 400 }
            );
        }

        startTime = performance.now();
        // authenticate admin
        const currentAdmin = await getCurrentAdmin();
        timings.getCurrentAdmin = performance.now() - startTime;
        if(!currentAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
        }

        startTime = performance.now();
   

            const [adminExists, workerExistence] = await Promise.all([
                User.exists({
                    _id: currentAdmin.adminId,
                    role: "admin"
                }),
                Worker.exists({
                    _id: workerId,
                    adminId: currentAdmin.adminId
                })
            ]);

            timings.existenceChecks = performance.now() - startTime;

            if (!adminExists) {
                return NextResponse.json(
                    { message: "Admin not found" },
                    { status: 404 }
                );
            }

            if (!workerExistence) {
                return NextResponse.json(
                    { message: "Worker not found" },
                    { status: 404 }
                );
            }
            const attendanceDate = getISTStartDate(selectedDate);
            // console.log("Selected Date (IST):", selectedDate);
            // console.log("Attendance Date (UTC):", attendanceDate.toISOString());    

            const today = getISTStartDate();

            if(attendanceDate > today){
                return NextResponse.json({message:"Cannot mark attendance for future dates"},{status:400});
            }

            startTime = performance.now();
            const markAttendance = await Attendance.findOneAndUpdate(
                {
                    adminId: currentAdmin.adminId,
                    workerId,
                    attendanceDate
                },
                {
                    adminId: currentAdmin.adminId,
                    workerId,
                    attendanceDate,
                    status
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            ).lean();

        // console.log("Attendance marked:", markAttendance);
        timings.markAttendance = performance.now() - startTime;

        if(!markAttendance){
            return NextResponse.json({message:"Error marking attendance"},{status:500});
        }

        timings.totalTime = performance.now() - intialTime;

        console.log("Timings for mark Attendance: ",timings);

        return NextResponse.json({message:"Attendance marked successfully"},{status:200});

      } catch (error) {
         console.error("Error marking attendance:", error);
         return NextResponse.json({message:"Internal server error"},{status:500});
        
      }
}