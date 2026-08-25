import { dbConnect } from "@/lib/Connections/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function DELETE(request){
     try {
        await dbConnect();
        const {searchParams} = new URL(request.url);
        const id = searchParams.get("id");

        if(!id){
            return NextResponse.json({message:"Id not found"},{status:400});
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

        const deletedPayment = await Payment.findOneAndDelete({_id: id, adminId: currentAdmin.adminId});
        // console.log("deletedPayment= ",deletedPayment);

        if(!deletedPayment){
            return NextResponse.json({message:"Payment not found"},{status:404});
        }

        return NextResponse.json({message:"Payment deleted successfully"},{status:200});

     } catch (error) {
        console.log("Error in deleting payment", error);
        return NextResponse.json({message:"Error in deleting payment"},{status:500});
     }
}