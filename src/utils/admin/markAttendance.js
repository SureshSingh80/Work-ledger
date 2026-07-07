import axios from "axios";

export async function markAttendance(workerId, status) {
    try {
         const res = await axios.post('/api/admin/markAttendance', { workerId, status });
         return { success: true, data: res.data};
    } catch (error) {
        console.log("Error in marking attendance", error);
        return { success: false, error: error.response?.data?.message || "An error occurred while marking attendance." };
    }

}