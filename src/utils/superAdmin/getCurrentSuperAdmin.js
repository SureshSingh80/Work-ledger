import { cookies } from "next/headers";
import { verifySuperAdminToken } from "./verifySuperAdminToken";

export async function getCurrentSuperAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get("superAdminToken")?.value;
  

  if (!token) {
    return null;
  }

  const result = await verifySuperAdminToken(token);
  // console.log("Verification Result:", result);

  if (!result.ok) {
    return null;
  }

  const decoded = result.data;
  // console.log("Decoded Token:", decoded);

 if (decoded?.role !== "superAdmin") {
  return null;
}

  return decoded;
}
