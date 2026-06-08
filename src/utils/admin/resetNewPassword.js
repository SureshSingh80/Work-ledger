import axios from "axios";

export async function resetNewPassword(email,newPassword, confirmPassword) {
    try {
        const res = await axios.post('/api/admin/set-new-password', {email, newPassword, confirmPassword });
        return {success:true, data: res?.data?.message || "Password reset successfully"};
    } catch (error) {
        console.log("Error in set new password", error);
        return {success:false, error: error?.response?.data || {message: "Something went wrong"}};
    }

}