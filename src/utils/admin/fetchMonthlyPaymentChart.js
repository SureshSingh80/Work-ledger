import axios from "axios"

export async function fetchMonthlyPaymentChart(month) {
   const res = await axios.get(`/api/admin/fetch-monthly-payments-chart?month=${month}`);
   return res.data;
}