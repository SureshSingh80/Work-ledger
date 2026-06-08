import { dbConnect } from "@/lib/Connections/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request){
     try {
         await dbConnect();

         const admins = await User.find({role:"admin"});

         if(!admins) {
            return NextResponse.json({message:"No admins found"}, {status:404});
         }

        //  Decrypting passwords
        
         const formatedAdmins = admins.map(admin => ({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            password: admin.password,
            isActive: admin.isActive,
            createdAt: admin.createdAt
         }));
        //  console.log("Admins fetched successfully:", formatedAdmins); 
            return NextResponse.json({admins: formatedAdmins}, {status:200});
     } catch (error) {
        console.log("Error fetching admins:", error);
        return NextResponse.json({message:"Error fetching admins"}, {status:500});
     }
}