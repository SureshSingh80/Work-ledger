import { dbConnect } from "@/lib/Connections/dbConnect";
import { workerSchema } from "@/lib/validations/worker.schema";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function POST(request){
      try {
          await dbConnect();
          const body = await request.json();

          // authentication of admin
          const currentAdmin = await getCurrentAdmin();
          if(!currentAdmin)
              return NextResponse.json({message:"Unauthorized"},{status:401});
          // get admin existence
          const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

          if(!adminExists){
              return NextResponse.json({message:"Admin not found"},{status:404});
          }

          // zod validation
          const parseData = workerSchema.safeParse(body);

          if(!parseData.success){
              return NextResponse.json({message:parseData.error},{status:400});
          }

          const parsedData = parseData.data;

          // create worker
             await Worker.create({
              adminId: currentAdmin.adminId,
              name: parsedData.name,
              mobile: parsedData.mobile,
              address: parsedData.address,
              workerType: parsedData.workerType,
              dailyWage: parsedData.dailyWage,
              joiningDate: parsedData.joiningDate 
          });

          return NextResponse.json({ message: "Worker created successfully"},{status:200});
      } catch (error) {
          console.log("Error in creating worker",error);
          return NextResponse.json({message:"Error in creating a new worker"},{status:500});
      }
}