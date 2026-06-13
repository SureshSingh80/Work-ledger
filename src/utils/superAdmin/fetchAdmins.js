import axios from "axios";

export async function fetchAdmins(){
        const res = await axios.get("/api/super-admin/fetch-admins");
        return res.data.admins;
}