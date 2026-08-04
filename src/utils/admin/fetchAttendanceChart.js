import axios from "axios";

export async function fetchAttendanceChart(month){
    const res = await axios.get(`/api/admin/fetch-attendance-chart?month=${month}`);
    return res.data;
}