import { dbConnect } from "@/lib/Connections/dbConnect";
import { getISTStartDate } from "@/lib/dateUtils";
import { paymentSchema } from "@/lib/validations/payment.schema";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Worker from "@/models/Worker";
import { getCurrentAdmin } from "@/utils/admin/getCurrentAdmin";
import { NextResponse } from "next/server";

export async function POST(request){
    try {
        await dbConnect();
        const body = await request.json();

        const validation = paymentSchema.safeParse(body);

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

        const {
            workerId,
            amount,
            paymentMethod,
            selectedDate,
            note,
        } = validation.data;

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

            const workerExists = await Worker.exists({
                _id: workerId,
                adminId: currentAdmin.adminId,
            });

            if (!workerExists) {
                return NextResponse.json(
                    { message: "Worker not found" },
                    { status: 404 }
                );
            }

            const paymentDate = getISTStartDate(selectedDate);

            const today = getISTStartDate();

            if(paymentDate > today){
                return NextResponse.json({message:"Invalid payment date"},{status:400});
            }

            const payment = await Payment.create({
                adminId: currentAdmin.adminId,
                workerId,
                amount,
                paymentMethod,
                paymentDate,
                note:note?.trim() || ""
            });

            console.log("Payment created = ",payment);

            return NextResponse.json({message:"Payment created successfully!"},{status:201});




    } catch (error) {
        console.log("Error in creating payment", error);
        return NextResponse.json({message:"Error in creating payment"},{status:500});
    }
}