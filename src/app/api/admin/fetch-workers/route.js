import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function GET(request){
      try {
          await dbConnect();

          const currentAdmin = await getCurrentAdmin();

          if(!currentAdmin){
              return NextResponse.json({message:"Unauthorized"},{status:401});
          }

        // get admin existence
          const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

          if(!adminExists){
              return NextResponse.json({message:"Admin not found"},{status:404});
          }

          const workers = await Worker.find({adminId: currentAdmin.adminId}).lean();
          
          return NextResponse.json({workers:workers},{status:200});


      } catch (error) {
          console.log("Error fetching workers: ",error);
          return NextResponse.json({message:"Error fetching workers"},{status:500});
      }
}