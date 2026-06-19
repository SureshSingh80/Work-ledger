import { cookies } from "next/headers";
import { verifyAdminToken } from "./verifyAdminToken";

export async function getCurrentAdmin() {

  const cookieStore = await cookies();

  const token = cookieStore.get("adminToken")?.value;
  // console.log("Admin Token:", token);

  if (!token) {
    return null;
  }

  const result = await verifyAdminToken(token);
  // console.log("Verification Result:", result);

  if (!result.ok) {
    return null;
  }

  const decoded = result.data;

  if(decoded?.role !== "admin"){
    return null;
  }

  return decoded;
}