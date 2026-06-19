import axios from "axios";

export async function EditWorkerById(workerId, updatedData) {
    try {
        const res = await axios.patch(`/api/admin/edit-worker?id=${workerId}`, updatedData);
        return {success: true, data: res?.data?.message || "Worker updated successfully"};
    } catch (error) {
        console.log("Error in updating worker", error);
        return {success: false, error: error?.response?.data?.message || error.message || "Error in updating worker"};
    }
}