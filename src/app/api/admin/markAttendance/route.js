import { dbConnect } from "@/lib/Connections/dbConnect";
import { getISTStartDate } from "@/lib/dateUtils";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function POST(request){
      try {
         await dbConnect();
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

        // authenticate admin
        const currentAdmin = await getCurrentAdmin();
                
        if(!currentAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
        }

        // get admin existence
        const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

        if(!adminExists){
            return NextResponse.json({message:"Admin not found"},{status:404});
        }

        // get worker existence
        const workerExistence = await Worker.exists({_id: workerId, adminId: currentAdmin.adminId});

        if(!workerExistence){
            return NextResponse.json({message:"Worker not found"},{status:404});
        }

            const attendanceDate = getISTStartDate(selectedDate);
            // console.log("Selected Date (IST):", selectedDate);
            // console.log("Attendance Date (UTC):", attendanceDate.toISOString());    

            const today = getISTStartDate();

            if(attendanceDate > today){
                return NextResponse.json({message:"Cannot mark attendance for future dates"},{status:400});
            }

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
        
        if(!markAttendance){
            return NextResponse.json({message:"Error marking attendance"},{status:500});
        }

        return NextResponse.json({message:"Attendance marked successfully"},{status:200});

      } catch (error) {
         console.error("Error marking attendance:", error);
         return NextResponse.json({message:"Internal server error"},{status:500});
        
      }
}