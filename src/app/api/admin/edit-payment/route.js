import { dbConnect } from "@/lib/Connections/dbConnect";
import { getISTStartDate } from "@/lib/dateUtils";
import { editablePaymentSchema } from "@/lib/validations/EditablePayment.schema";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function PATCH(request){
    try {
         await dbConnect();
        const body = await request.json();

        const validation = editablePaymentSchema.safeParse(body);
        console.log("validation= ",validation);
        
                if (!validation.success) {
                    return NextResponse.json(
                        {
                            message: validation.error.issues[0].message,
                        },
                        {
                            status: 400,
                        }
                    );
                }

        const {paymentId,amount,paymentDate,paymentMethod,note} = validation.data;
        console.log("payment date=",paymentDate);
     

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

            const updatedPayment = await Payment.findOneAndUpdate({_id: paymentId, adminId: currentAdmin.adminId},{amount,paymentDate: getISTStartDate(paymentDate),paymentMethod,note},{new:true}).lean();
            
        
            if(!updatedPayment){
                return NextResponse.json({message:"Payment not found"},{status:404});
            }
            return NextResponse.json({message:"Payment updated successfully"},{status:200});
        
    } catch (error) {
        console.log("Error in updating payment", error);
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}