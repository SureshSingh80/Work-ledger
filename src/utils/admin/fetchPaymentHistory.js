import axios from "axios";

export async function fetchPaymentHistory(id,month){
    const res = await axios.get(`/api/admin/fetch-payment-history?id=${id}&month=${month}`);
    return res.data;
}