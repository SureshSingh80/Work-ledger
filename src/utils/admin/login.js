import axios from "axios";

export async function login(credentials){
    try {
        const res = await axios.post('/api/user/login',credentials);
        return {success:true,data:res?.data}
    } catch (error) {
        return {success:false,error:error?.response?.data?.message || "Login failed"}
    }
}