
import { verifyAdminToken } from "@/utils/admin/verifyAdminToken";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export default async function ProtectedAdminLayout({children}) {

    const cookieStore = await cookies();
    
    // console.log("Cookies in admin layout = ",cookieStore.getAll());
    const adminToken = cookieStore.get("adminToken")?.value || null;

    if(!adminToken){
        redirect("/admin/login");
    }

    const result = await verifyAdminToken(adminToken);
    // console.log("Admin token verification result = ",result);
    if(!result.ok){
        console.log("Invalid or expired admin token");
        redirect("/admin/logout");
    }

    return <>{children}</>
}