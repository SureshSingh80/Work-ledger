import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
           await dbConnect();
           const {searchParams} = new URL(request.url);
           const id = searchParams.get("id");

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

            const worker = await Worker.findOne({_id: id}).lean();
            // console.log("worker= ",worker);

            return NextResponse.json({worker:worker},{status:200});
          
     } catch (error) {
          console.log("Error fetching worker: ",error);
          return NextResponse.json({message:"Error fetching worker"},{status:500});
     }
}