import User from "@/models/User";
import {NextResponse} from "next/server";
import { dbConnect } from "@/lib/Connections/dbConnect";
import { transporter } from "@/lib/sendMail";
import bcrypt from "bcryptjs";

export async function POST(request){
    try{
        await dbConnect();
        const { adminIdOrEmail } = await request.json();
        console.log("Received forgot password request for:", adminIdOrEmail); // Debugging log

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

        // sending email process

        // console.log("admin found:", admin); // Debugging log


        // OTP generation and saving to database
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

        const hashedOTP = await bcrypt.hash(otp, 10); // Hash the OTP before saving

        admin.otp = hashedOTP;
        admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        await admin.save();

        // Send email with OTP
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

        return NextResponse.json({message: "OTP Sent Successfully To registered email", email:admin.email },{ status: 200 });
    }catch(error){
        console.error("Error occurred while processing forgot password request:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}