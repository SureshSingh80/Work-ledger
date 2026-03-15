import axios from "axios";


export async function createSuperAdmin(data){
    try {
        const res = await axios.post(`/api/super-admin/create-super-admin`,data);
        return {success:true,data:res?.data?.message};
    } catch (error) {
         console.log("Error in createSuperAdmin",error);
         return {success:false,error:error?.response?.data?.message || error.message || "Error in creating super admin"};

    }
}