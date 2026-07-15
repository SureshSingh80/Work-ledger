import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
         await dbConnect();
         const {searchParams} = new URL(request.url);
         const id = searchParams.get("id");
         const month = searchParams.get("month");
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

         let worker = await Worker.exists({
            _id: id,
            adminId: currentAdmin.adminId,
        });

        if (!worker) {
            return NextResponse.json(
                { message: "Worker not found" },
                { status: 404 }
            );
        }

        worker = await Worker.findOne({
            _id: id,
            adminId: currentAdmin.adminId
        })
        .select("name workerType dailyWage joiningDate")
        .lean();

        // base query
        const historyQuery = {
            adminId: currentAdmin.adminId,
            workerId: id,
        };

         // for filter
         if (month) {

            const year = new Date().getFullYear();

            const startDate = new Date(year, Number(month) - 1, 1);

            const endDate = new Date(year, Number(month), 1);

            historyQuery.attendanceDate = { 
                $gte: startDate,
                $lt: endDate,
            };
        }

        console.log("History query: ",historyQuery);

        const summaryQuery = {
            adminId: currentAdmin.adminId,
            workerId: id,
        };

        if (month) {

            const year = new Date().getFullYear();

            const startDate = new Date(year, Number(month) - 1, 1);

            const endDate = new Date(year, Number(month), 1);

            summaryQuery.attendanceDate = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        const [totalPresent, totalAbsent, totalHalfDay] = await Promise.all([

            Attendance.countDocuments({
                ...summaryQuery,
                status: "Present",
            }),

            Attendance.countDocuments({
                ...summaryQuery,
                status: "Absent",
            }),

            Attendance.countDocuments({
                ...summaryQuery,
                status: "Half Day",
            }),

        ]);

         const history = await Attendance.find(historyQuery).sort({ attendanceDate: -1 }).lean();
        //  console.log("Attendance history: ",history);

         return NextResponse.json({
                worker,
                summary: {
                    totalPresent,
                    totalAbsent,
                    totalHalfDay,
                },
                history,
            });


    } catch (error) {
        console.log("Error fetching workers: ",error);
        return NextResponse.json({message:"Error fetching workers"},{status:500});
    }
}