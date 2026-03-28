import axios from "axios";

export async function logout(){
      try {
         const res = await axios.post("/api/super-admin/logout");
         return {success:true,data:res.data}
      } catch (error) {
         console.log("Error in logout");
         return {success:false,error:error?.response?.data?.message || "Error in logout"}
      }
}