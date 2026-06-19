import axios from "axios";

export async function fetchWorkers(){
    
        const res = await axios.get("/api/admin/fetch-workers");
        return res.data;
    
}