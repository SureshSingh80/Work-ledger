import axios from "axios";

export async function fetchWorkerTypeChart(){
    const res = await axios.get("/api/admin/fetch-worker-type-chart");
    return res.data;
}