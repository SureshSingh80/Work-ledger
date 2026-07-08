import axios from "axios";

export async function fetchAttendanceWorkers({search, filter, selectedDate}){
    const res = await axios.get(`/api/admin/fetch-attendance-workers?search=${search}&filter=${filter}&date=${selectedDate}`);
    return res.data;
}