import { jwtVerify } from "jose";

export async function verifySuperAdminToken(superAdminToken){
     try {
         const secret =  new TextEncoder().encode(process.env.JWT_SECRET);
        //  console.log("Decoded Super Admin token payload = ",payload);
         const {payload} = await jwtVerify(superAdminToken, secret);

         

         if(!payload || payload.role !== "superAdmin"){
             return {ok: false, message: "Not SuperAdmin"};
         }

         return {ok: true, message: "Valid SuperAdmin Token", data: payload};
     } catch (error) {
        return {ok: false, message: "Invalid or Expired SuperAdmin Token"};
     }
}