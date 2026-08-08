import axios from "axios";

export async function fetchTopEarnersChart(month) {
   const res = await axios.get(`/api/admin/fetch-top-earners-chart?month=${month}`);
   return res.data;

}