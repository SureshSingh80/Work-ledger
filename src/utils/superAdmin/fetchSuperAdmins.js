import axios from "axios";

export async function fetchSuperAdmins(){
    const res = await axios.get(
    "/api/super-admin/fetch-super-admins"
  );

  return res.data.superAdmins;
}