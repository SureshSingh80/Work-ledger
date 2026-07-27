import axios from "axios";

export async function fetchPendingWorkers(debouncedSearch, filterType) {
    const res = await axios.get(`/api/admin/fetch-pending-workers?search=${debouncedSearch}&filter=${filterType}`);
    return res.data;
}