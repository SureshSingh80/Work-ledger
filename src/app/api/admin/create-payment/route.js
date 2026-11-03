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
        const initialTime = performance.now();
        const timings ={};
        let startTime = performance.now();
        await dbConnect();
        timings.dbConnect = performance.now() - startTime;
        const body = await request.json();

        startTime = performance.now();
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

        timings.validation = performance.now() - startTime;

         startTime = performance.now();

        // authenticate admin
            const currentAdmin = await getCurrentAdmin();
                    
            if(!currentAdmin){
                return NextResponse.json({message:"Unauthorized"},{status:401});
            }

            timings.getCurrentAdmin = performance.now() - startTime;
    
            startTime = performance.now();
            // get admin existence
            startTime = performance.now();

            const [adminExists, workerExists] = await Promise.all([
                User.exists({
                    _id: currentAdmin.adminId,
                    role: "admin"
                }),
                Worker.exists({
                    _id: workerId,
                    adminId: currentAdmin.adminId
                })
            ]);

            timings.existenceChecks = performance.now() - startTime;

            if (!adminExists) {
                return NextResponse.json(
                    { message: "Admin not found" },
                    { status: 404 }
                );
            }

            if (!workerExists) {
                return NextResponse.json(
                    { message: "Worker not found" },
                    { status: 404 }
                );
            }

            const paymentDate = getISTStartDate(selectedDate);
            console.log("paymentDate= ",paymentDate);

            const today = getISTStartDate();

            if(paymentDate > today){
                return NextResponse.json({message:"Invalid payment date"},{status:400});
            }

            startTime = performance.now();
            const payment = await Payment.create({
                adminId: currentAdmin.adminId,
                workerId,
                amount,
                paymentMethod,
                paymentDate,
                note:note?.trim() || ""
            });

            console.log("Payment created = ",payment);

            timings.createPayment = performance.now() - startTime;
            timings.totalTime = performance.now() - initialTime;

            console.log("timings for payments create API = ",timings);


            return NextResponse.json({message:"Payment created successfully!"},{status:201});




    } catch (error) {
        console.log("Error in creating payment", error);
        return NextResponse.json({message:"Error in creating payment"},{status:500});
    }
}