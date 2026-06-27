import axios from "axios";

export async function deleteWorker(workerId){
    try {
        const res = await axios.delete(`/api/admin/delete-worker`,{data:{workerId}});
        return {success:true, data: res?.data?.message};
    } catch (error) {
        console.log("Error in deleting worker", error);
        return {success:false, error: error?.response?.data?.message || error.message || "Error in deleting worker"};
    }


}