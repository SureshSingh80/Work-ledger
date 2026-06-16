import { cookies } from "next/headers";
import { verifyAdminToken } from "./verifyAdminToken";

export async function getCurrentAdmin() {

  const cookieStore = await cookies();

  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    return null;
  }

  const result = await verifyAdminToken(token);

  if (!result.ok) {
    return null;
  }

  const decoded = result.data;

  if(decoded?.role !== "admin"){
    return null;
  }

  return decoded;
}