import axios from "axios";

export async function toggleAdminStatus(id){
   try {
      const res = await axios.patch(`/api/super-admin/toggle-status`,{id});
      return res.data;
   } catch (error) {
      console.error("Error toggling admin status:", error);
      throw new Error("Failed to toggle admin status");
   }

}