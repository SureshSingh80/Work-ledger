import { dbConnect } from "@/lib/Connections/dbConnect";
// import Attendance from "@/models/Attendance";
// import Payment from "@/models/Payment";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import mongoose from "mongoose";

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const filter = searchParams.get("filter");

    // console.log("search: ", search, " filter: ", filter);

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminExists = await User.exists({
      _id: currentAdmin.adminId,
      role: "admin",
    });

    if (!adminExists) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const adminObjectId = new mongoose.Types.ObjectId(currentAdmin.adminId);

    const workers = await Worker.aggregate([
      {
        $match: {
          adminId: adminObjectId,

          ...(search && {
            $or: [
              {
                name: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                mobile: {
                  $regex: search,
                },
              },
            ],
          }),

          ...(filter &&
            filter !== "All" && {
              workerType: filter,
            }),
        },
      },
      {
        $lookup: {
          from: "attendances",
          let: {
            workerId: "$_id",
            adminId: "$adminId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$workerId", "$$workerId"] },
                    { $eq: ["$adminId", "$$adminId"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalPresent: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
                  },
                },
                totalHalfDay: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Half Day"] }, 1, 0],
                  },
                },
                totalAbsent: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Absent"] }, 1, 0],
                  },
                },
              },
            },
          ],
          as: "attendanceStats",
        },
      },
      {
        $lookup: {
          from: "payments",
          let: {
            workerId: "$_id",
            adminId: "$adminId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$workerId", "$$workerId"] },
                    { $eq: ["$adminId", "$$adminId"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalPaid: { $sum: "$amount" },
              },
            },
          ],
          as: "paymentStats",
        },
      },
      {
        $addFields: {
          totalPresent: {
            $ifNull: [{ $first: "$attendanceStats.totalPresent" }, 0],
          },
          totalHalfDay: {
            $ifNull: [{ $first: "$attendanceStats.totalHalfDay" }, 0],
          },
          totalAbsent: {
            $ifNull: [{ $first: "$attendanceStats.totalAbsent" }, 0],
          },
          totalPaid: {
            $ifNull: [{ $first: "$paymentStats.totalPaid" }, 0],
          },
        },
      },
      {
        $addFields: {
          workedDays: {
            $add: ["$totalPresent", { $multiply: ["$totalHalfDay", 0.5] }],
          },
          totalEarned: {
            $multiply: [
              {
                $add: ["$totalPresent", { $multiply: ["$totalHalfDay", 0.5] }],
              },
              "$dailyWage",
            ],
          },
        },
      },
      {
        $addFields: {
          pending: { $subtract: ["$totalEarned", "$totalPaid"] },
        },
      },
      {
        $match: {
          pending: { $ne: 0 },
        },
      },
      {
        $project: {
          attendanceStats: 0,
          paymentStats: 0,
        },
      },
      {
        $sort: {
          pending: -1,
          joiningDate: -1,
        },
      },
    ]);

    return NextResponse.json(
      {
        workers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching pending workers:", error);
    return NextResponse.json(
      { message: "Error fetching workers" },
      { status: 500 }
    );
  }
}