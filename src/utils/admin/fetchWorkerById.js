import axios from "axios";

export async function fetchWorkerById(workerId){
    const res = await axios.get(`/api/admin/fetch-worker?id=${workerId}`);
    return res.data;
}