import { dbConnect } from "@/lib/Connections/dbConnect";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
      try {
         await dbConnect();
         const {searchParams} = new URL(request.url);
         const month = Number(searchParams.get("month"));

            if (isNaN(month) || month < 0 || month > 12) {
                return NextResponse.json(
                    { message: "Bad request" },
                    { status: 400 }
                );
            }

          const currentAdmin = await getCurrentAdmin();
                      
            if(!currentAdmin){
                return NextResponse.json({message:"Unauthorized"},{status:401});
            }

            // get admin existence
            const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

            if(!adminExists){
                return NextResponse.json({message:"Admin not found"},{status:404});
            }

             const year = new Date().getFullYear();

            const startDate = new Date(year, Number(month) - 1, 1);
            const endDate = new Date(year, Number(month), 1);

            // console.log("startDate,EndDate",startDate.toString(),endDate.toString());

            const adminObjectId = new mongoose.Types.ObjectId(currentAdmin.adminId);

             let matchStage = {
                adminId: adminObjectId,
            };

            if (month !== 0) {
                console.log("month", month);
                matchStage.attendanceDate = {
                    $gte: startDate,
                    $lt: endDate,
                };
            }

            const attendanceAnalysis = await Attendance.aggregate([
                {
                    $match: matchStage
                },

                {
                    $group: {
                        _id: "$workerId",

                        totalPresent: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "Present"] },
                                    1,
                                    0,
                                ],
                            },
                        },

                        totalHalfDay: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "Half Day"] },
                                    1,
                                    0,
                                ],
                            },
                        },

                        totalAbsent: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "Absent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },

                {
                    $addFields: {
                        workedDays: {
                            $add: [
                                "$totalPresent",
                                {
                                    $multiply: [
                                        "$totalHalfDay",
                                        0.5,
                                    ],
                                },
                            ],
                        },
                    },
                },

                {
                    $lookup: {
                        from: "workers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "worker",
                    },
                },

                {
                    $unwind: {
                        path: "$worker",
                        preserveNullAndEmptyArrays: false,
                    },
                },

                {
                    $project: {
                        _id: 0,
                        workerId: "$worker._id",
                        workerName: "$worker.name",
                        workerType: "$worker.workerType",

                        totalPresent: 1,
                        totalHalfDay: 1,
                        totalAbsent: 1,
                        workedDays: 1,
                    },
                },

                {
                    $sort: {
                        workedDays: -1,
                    },
                },
            ]);

            // console.log("attendanceAnalysis",attendanceAnalysis);
            return NextResponse.json({attendanceAnalysis},{status:200});
      } catch (error) {
        console.error("Error fetching attendance chart:", error);
        return NextResponse.json({message:"Error fetching attendance chart"},{status:500});
      }
}