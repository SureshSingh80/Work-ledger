import axios from "axios";

export async function createRequestAccess(params) {
    try {
        const res = await axios.post("/api/create-request-access", params);
    } catch (error) {
        
    }
}