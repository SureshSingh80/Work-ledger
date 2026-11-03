import { dbConnect } from "@/lib/Connections/dbConnect";
import { getISTMonthRange } from "@/lib/dateUtils";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const initialTime = performance.now();
        let startTime = performance.now();
        const timings = {};
         await dbConnect();
         timings.dbConnect = performance.now() - startTime;
         const {searchParams} = new URL(request.url);
         const id = searchParams.get("id");
         const month = searchParams.get("month");
         if(!id) return NextResponse.json({message:"Bad request"},{status:400});

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
         const worker = await Worker.findOne({
            _id: id,
            adminId: currentAdmin.adminId,
            })
            .select("name workerType dailyWage joiningDate")
            .lean();

            if (!worker) {
            return NextResponse.json(
                { message: "Worker not found" },
                { status: 404 }
            );
        }
        timings.getWorkerDetails = performance.now() - startTime;

        // base query
        const historyQuery = {
            adminId: currentAdmin.adminId,
            workerId: id,
        };

         // for filter
         if (month) {

            const year = new Date().getFullYear();

            const { startDate, endDate } = getISTMonthRange(year, month);

            console.log("startDate= ",startDate,"endDate= ",endDate);

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
            // const startDate = new Date(year, Number(month) - 1, 1);
            // const endDate = new Date(year, Number(month), 1);

            const { startDate, endDate } = getISTMonthRange(year, month);

            summaryQuery.attendanceDate = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        startTime = performance.now();
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

       
        timings.getSummaryCounts = performance.now() - startTime;


        startTime = performance.now();
         const history = await Attendance.find(historyQuery).sort({ attendanceDate: -1 }).lean();
        //  console.log("Attendance history: ",history);
        timings.getHistory = performance.now() - startTime;
        timings.totalTime = performance.now() - initialTime;

        console.log("Timings: ",timings);

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