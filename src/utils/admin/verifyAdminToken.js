import { jwtVerify } from "jose";

export async function verifyAdminToken(adminToken){
     try {
         const secret =  new TextEncoder().encode(process.env.JWT_SECRET);
        //  console.log("Decoded Super Admin token payload = ",payload);
         const {payload} = await jwtVerify(adminToken, secret);

         

         if(!payload || payload.role !== "admin"){
             return {ok: false, message: "Not Admin"};
         }

         return {ok: true, message: "Valid Admin Token", data: payload};
     } catch (error) {
        return {ok: false, message: "Invalid or Expired Admin Token"};
     }
}