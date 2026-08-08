import axios from "axios";

export async function fetchOverAllWorkForceChart() {
    const res = await axios.get("/api/admin/fetch-workforce-report-chart");
    return res.data;

}