import { NextResponse } from "next/server";

export async function POST(request){

     const response = NextResponse.json({message:"logout success"});

     response.cookies.set("adminToken","",{
        expires: new Date(0)
     })

     return response;
}