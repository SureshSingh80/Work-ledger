import axios from "axios";

export async function fetchHighestPendingChart() {   
     const res = await axios.get('/api/admin/fetch-highest-pending-chart');
     return res.data;
}