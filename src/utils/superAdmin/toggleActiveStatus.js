import axios from "axios";

export async function toggleActiveStatus(id){
    try {
        const res = await axios.patch(`/api/super-admin/toggle-status/${id}`);
        return {success:true,data:res.data.message};
    } catch (error) {
        console.log("Failed to toggle Active Status");
        return {success:false,error:error.response?.data?.message || "Failed to Toggle Status"};
    }

}