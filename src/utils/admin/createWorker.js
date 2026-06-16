import axios from "axios";

export async function createWorker(data){

    try {
        const res = await axios.post('/api/admin/create-worker', data);
        return {success: true, data: res?.data?.message};
    } catch (error) {
        console.log("Error in creating worker", error);
        return {success: false, error: error?.response?.data?.message || error.message || "Error in creating worker"};
    }
}