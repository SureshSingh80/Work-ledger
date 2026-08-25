import axios from "axios";

export async function deletePayment(id){
    try {
        const res = await axios.delete(`/api/admin/delete-payment?id=${id}`);
        return {success:true,data:res.data.message}
    } catch (error) {
        console.log("Error in deleting payment", error);
        return {success:false,error:error.response?.data?.message || error.message || "Error in deleting payment"};
    }
}