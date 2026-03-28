import { NextResponse } from "next/server";

export async function proxy(request){
     const path = request.nextUrl.pathname;
     const adminToken = request.cookies.get("adminToken")?.value || null;
     const superAdminToken = request.cookies.get("superAdminToken")?.value || null;

     const isPublicPath =
        path === "/login" ||
        path === "/signup" ||
        path === "/" || 
        path === "/forgot-password";

    const isSuperAdminPath = path.startsWith("/super-admin");

    if(isSuperAdminPath && path !== "/super-admin/login"){
        if(!superAdminToken){
            return Response.redirect(new URL("/super-admin/login", request.url));
        }
    }

    if(!isPublicPath && !isSuperAdminPath){
        if(!adminToken){
            return Response.redirect(new URL("/login", request.url));
        }
    }

    // Block auth pages when already logged in
//   if (path === "/login" || path === "/signup" || path === "/forgot-password") {
//     if (adminToken) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//   }

//   if(path === "/super-admin/login"){
//         if(superAdminToken){
//              return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
//         }
//   }

  return NextResponse.next();       
    
}

export const config = {
    matcher:[
        "/",
        "/super-admin/:path*",        
        "/admin/:path*",
        "/login",
        "/signup",
        "/forgot-password",
        "/profile",
        "/dashboard"

      
    ]
};