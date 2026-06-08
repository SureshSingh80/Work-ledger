import axios from "axios";

export async function forgotPassword(adminIdOrEmail) {
   
    try{
        const res = await axios.post('/api/admin/forgot-password', { adminIdOrEmail });
        return {success: true, message: res?.data?.message, email: res?.data?.email };
    }catch(error){
        console.log("Error in forgotPassword", error);
        return {success: false, error: error.response?.data?.message || 'An error occurred'};
    }

}