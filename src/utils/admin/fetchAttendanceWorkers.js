import axios from "axios";

export async function fetchAttendanceWorkers({search, filter}){
    const res = await axios.get(`/api/admin/fetch-attendance-workers?search=${search}&filter=${filter}`);
    return res.data;
}