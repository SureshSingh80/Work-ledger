import axios from "axios";

export async function fetchAttendanceHistory(id, month){
    
    const res = await axios.get(`/api/admin/fetch-attendance-history?id=${id}&month=${month}`);
    return res.data;
}