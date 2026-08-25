import axios from "axios";

export async function EditPayment(editableData){
    try {
        const res = await axios.patch('/api/admin/edit-payment', editableData);
        return {success:true, data: res?.data?.message};
    } catch (error) {
        console.log("Error in updating payment", error);
        return {success:false, error: error?.response?.data?.message || error.message || "Error in updating payment"};
    }
}