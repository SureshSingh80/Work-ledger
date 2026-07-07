import axios from "axios";

export async function searchWorkers(nameOrPhone){
    const res = await axios.get(`/api/admin/search-workers?query=${nameOrPhone}`);
    return res.data;
}