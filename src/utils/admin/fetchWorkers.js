import axios from "axios";

export async function fetchWorkers({search, filter}){
    
        const res = await axios.get("/api/admin/fetch-workers", {
            params: {
                search,
                filter
            }
        });
        return res.data;
    
}