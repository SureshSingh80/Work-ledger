import axios from "axios";

export async function filterWorkers(filterType){
    //  console.log("filterWorkers called with filterType: ", filterType);
    const res = await axios.get(`/api/admin/filter-workers?query=${filterType}`);
    return res.data;
}