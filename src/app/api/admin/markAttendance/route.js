import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function POST(request){
      try {
         await dbConnect();
         const { workerId, status } = await request.json();

         // validate 
        if(!workerId || !status){
            return NextResponse.json({message:"Worker ID and status are required."},{status:400});
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
        const worker = await Worker.findOne({_id: workerId, adminId: currentAdmin.adminId});

        if(!worker){
            return NextResponse.json({message:"Worker not found"},{status:404});
        }

            // add / update attendance        
        
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const markAttendance = await Attendance.findOneAndUpdate(
                {
                    adminId: currentAdmin.adminId,
                    workerId,
                    attendanceDate: today
                },
                {
                    adminId: currentAdmin.adminId,
                    workerId,
                    attendanceDate: today,
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