
import { cleanupInvalidSuperAdminToken } from "@/utils/superAdmin/logout";
import { verifySuperAdminToken } from "@/utils/superAdmin/verifySuperAdminToken";
import axios from "axios";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export default async function ProtectedSuperAdminLayout({children}) {

    const cookieStore = await cookies();
    // console.log("Cookies in super admin layout = ",cookieStore.getAll());
    const superAdminToken = cookieStore.get("superAdminToken")?.value || null;

    if(!superAdminToken){
        redirect("/super-admin/login");
    }

    const result = await verifySuperAdminToken(superAdminToken);
    // console.log("Super Admin token verification result = ",result);
    if(!result.ok){
        
        redirect("/super-admin/cleanup-invalid-token");
    }

    return <>{children}</>
}