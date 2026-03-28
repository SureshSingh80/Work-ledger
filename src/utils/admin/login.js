import axios from "axios";

export async function login(credentials){
    // console.log("Logging in with credentials:", credentials);
    try {
        
        const res = await axios.post('/api/admin/login',credentials);
        return {success:true,data:res?.data?.message}
    } catch (error) {
        console.log("Error in login admin",error);
        return {success:false,error: error?.response?.data?.message || error.message || "Error in  Login Admin"}
    }
}