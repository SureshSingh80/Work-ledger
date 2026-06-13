import User from "@/models/User";
import {NextResponse} from "next/server";
import { dbConnect } from "@/lib/Connections/dbConnect";
import { transporter } from "@/lib/sendMail";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request){
    try{
        await dbConnect();
        const { adminIdOrEmail } = await request.json();
        

        const trimmedInput = adminIdOrEmail.trim();

        if (trimmedInput === "") {
            return NextResponse.json({ message: "AdminId or email is required" }, { status: 400 });
        }

        

        // finding user by email or username
        const admin = await User.findOne({
            $or: [
                { email: trimmedInput },
                { username: trimmedInput }
            ]
        });

        if (!admin) {
            return NextResponse.json({ message: "Admin not found" }, { status: 404 });
        }

        // otp cooldown for 60 seconds

        if (admin.otpRequestedAt && (Date.now() - admin.otpRequestedAt) < 60000) {
            return NextResponse.json({ message: "Please wait 60 seconds before requesting another OTP" }, { status: 429 });
        }

        // OTP generation and saving to database
        const otp = crypto.randomInt(100000, 1000000).toString(); // Generate a 6-digit OTP

        const hashedOTP = await bcrypt.hash(otp, 10); // Hash the OTP before saving

        admin.otp = hashedOTP;
        admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        admin.otpRequestedAt = new Date(); // Update the OTP requested time
        await admin.save();

        // Send email with OTP
        try {
                await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: admin.email,
                subject: "Password Reset OTP",
                html: `
                <h2>Password Reset Request For Work Ledger</h2>
                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>
                    This OTP will expire in 5 minutes.
                </p>
                `,
            });
        } catch (error) {
            admin.otp = null;
            admin.otpExpiry = null;
            admin.otpRequestedAt = null;
            await admin.save();
            // console.error("Error sending OTP email:", error);
            return NextResponse.json({ message: "Failed to send OTP email" }, { status: 500 });
        }

        return NextResponse.json({message: "OTP Sent Successfully To registered email", email:admin.email },{ status: 200 });
    }catch(error){
        console.error("Error occurred while processing forgot password request:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}