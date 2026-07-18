import axios from "axios";

export async function createPayment(amount, paymentMethod, paymentDate, note, workerId){
    
    try {
         const res = await axios.post('/api/admin/create-payment', {amount, paymentMethod, selectedDate:paymentDate, note, workerId});
         return {success:true,data:res?.data?.message};
    } catch (error) {
        console.log("Error in creating payment", error);
        return {success:false,error:error?.response?.data?.message || error.message || "Error in creating payment"};
    }
}