import axios from "axios";

export async function fetchAdmins(){
    try {
        const res = await axios.get("/api/super-admin/fetch-admins");
        return res.data.admins;
    } catch (error) {
        console.error("Error fetching admins:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch admins");
    }
}