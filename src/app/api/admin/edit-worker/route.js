import { dbConnect } from "@/lib/Connections/dbConnect";
import { workerSchema } from "@/lib/validations/worker.schema";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function PATCH(request){
     try {
         await dbConnect();
         const {searchParams} = new URL(request.url);
         const id = searchParams.get("id");

         if(!id) return NextResponse.json({message:"Bad request"},{status:400});

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
            return NextResponse.json({message:parseData.error.issues[0].message},{status:400});
        }

        const parsedData = parseData.data;

        const updatedWorker = await Worker.findOneAndUpdate({_id: id, adminId: currentAdmin.adminId}, parsedData, {new: true, runValidators: true}).lean();
        // console.log("updated Worker= ",updatedWorker);

        if(!updatedWorker){
            return NextResponse.json({message:"Worker not found"},{status:404});
        }

        return NextResponse.json({message:"Worker updated successfully"},{status:200});
         
       
     } catch (error) {
          console.log("Error updating worker: ",error);
          return NextResponse.json({message:"Error updating worker"},{status:500});
     }
}