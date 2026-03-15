import axios from "axios";

export async function login(credentials){
      try {
         const res = await axios.post("/api/super-admin/login", credentials);
         return {success:true, data: res.data.message};
      } catch (error) {
          console.log("Error in login super admin", error);
          return {success:false, error: error?.response?.data?.message || error.message || "Error in creating Login superAdmin"};
      }
}