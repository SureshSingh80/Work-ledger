import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validations/resetPassword.schema";

export async function POST(req){
    try {
        await dbConnect();
        const body = await req.json();

       
        const parsedData = resetPasswordSchema.safeParse(body);
        // console.log("Parsed data:", parsedData);

        if(!parsedData.success){
            return NextResponse.json({message:"Invalid Email id and password"}, {status: 400});
        }
        const {email, newPassword , confirmPassword} = parsedData.data;

        if(newPassword !== confirmPassword){
            return NextResponse.json({message: "Passwords do not match"}, {status: 400});
        }
        

        const user = await User.findOne({email: email});

        if(!user){
            return NextResponse.json({message: "User not found"}, {status: 404});
        }
        if(!user.resetToken || !user.resetTokenExpiry){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        if(user.resetTokenExpiry < new Date()){
            user.resetToken = null;
            user.resetTokenExpiry = null;

            await user.save();
            return NextResponse.json({message: "Token has expired"}, {status: 400});
        }

        // checking cookie token with bcrypted reset token in database
        const resetTokenFromCookie = req.cookies.get("resetToken")?.value;

        

        if (!resetTokenFromCookie) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const isTokenValid = await bcrypt.compare(resetTokenFromCookie, user.resetToken);

        

        if (!isTokenValid) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        const res = NextResponse.json({message: "Password reset successfully"}, {status: 200});

        // Clear the reset token cookie
        res.cookies.set("resetToken", "", { path: "/", expires: new Date(0) });

        return res;

    } catch (error) {
        console.log("Error in set new password", error);
        return NextResponse.json({message: "Failed to reset password"}, {status: 500});
    }
}