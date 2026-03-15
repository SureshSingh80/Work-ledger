import axios from "axios";

export async function createAdmin(data) {
    try {
        const res = await axios.post("/api/super-admin/create-admin", data);
        return {success: true, data: res?.data?.message};
    } catch (error) {
        console.log("Error in createAdmin", error);
        return {success: false, error: error?.response?.data?.message || error.message || "Error in creating admin"};
    }

}