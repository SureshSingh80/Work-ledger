import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function GET(request){
    console.log("filter-workers route called");
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const filterType = searchParams.get('query');

        console.log("filterType= ",filterType);
        
        if(!filterType) return NextResponse.json({message:"Bad request"},{status:400});
        
        const currentAdmin = await getCurrentAdmin();
                
        if(!currentAdmin){
            return NextResponse.json({message:"Unauthorized"},{status:401});
        }

        // get admin existence
        const adminExists =  await User.exists({_id: currentAdmin.adminId,role: "admin"});

        if(!adminExists){
            return NextResponse.json({message:"Admin not found"},{status:404});
        }

        const workers = await Worker.find({adminId: currentAdmin.adminId, workerType: filterType}).lean();
        console.log("workers= ",workers);
        return NextResponse.json({workers:workers},{status:200});


    } catch (error) {
        console.log("Error filtering workers: ",error);
        return NextResponse.json({message:"Internal Server Error"},{status:500});
    }
}