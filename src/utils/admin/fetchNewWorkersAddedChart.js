import axios from "axios";

export async function fetchNewWorkersAddedChart(year) {
  const res = await axios.get(`/api/admin/fetch-new-workers-added-chart?year=${year}`);
  return res.data;
}