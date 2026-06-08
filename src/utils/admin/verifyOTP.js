import axios from "axios";

export async function verifyOTP(email, otp){
    try {
        const res = await axios.post("/api/admin/verifyOTP", {email, otp});
        return {success: true, data: res.data};
    } catch (error) {
        console.log(error);
        return {success: false, error: error?.response?.data};
    }
}