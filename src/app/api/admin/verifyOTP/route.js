import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";


export async function POST(req){
    try {
            await dbConnect();
            const {email, otp} = await req.json();

            if(!email || !otp){
                return NextResponse.json({message: "Email and OTP are required"}, {status: 400});
            }

            const user = await User.findOne({email: email});

            if(!user){
                return NextResponse.json({message: "User not found"}, {status: 404});
            }

            if(!user.otp || !user.otpExpiry){
                return NextResponse.json({message: "OTP already used or not found"}, {status: 400});
            }

             // check if OTP is expired
            if(user.otpExpiry < new Date()){
                return NextResponse.json({message: "OTP has expired"}, {status: 400});
            }

            // compare OPT with bcrypted OTP in database
            const isOTPValid = await bcrypt.compare(otp, user.otp);


            if(!isOTPValid){
                return NextResponse.json({message: "Invalid OTP"}, {status: 400});
            }

           

            
            // clear OTP and expiry from database
            user.otp = null;
            user.otpExpiry = null;
           

            // create a resetToken and expiry for password reset
            const resetToken = crypto.randomBytes(32).toString("hex");;

            const hashedResetToken = await bcrypt.hash(resetToken, 10);

            user.resetToken = hashedResetToken;
            user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

           await user.save();

            // set in browser cookie for 10 minutes

            const res = NextResponse.json({ success: true, message:"OTP verified successfully" }, {status: 200});

            res.cookies.set("resetToken", resetToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 10 * 60 , // 10 minutes
            });

             
            return res;

    } catch (error) {
        console.log("Error in verify OTP:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}