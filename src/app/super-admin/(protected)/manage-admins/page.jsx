'use client'

import AdminList from '@/components/AdminList'
import { fetchAdmins } from '@/utils/superAdmin/fetchAdmins'
import { useQuery } from '@tanstack/react-query'

const Page = () => {

   // const { data, isLoading, isError, error } = useQuery({

   //    queryKey:["admins"],
   //    queryFn: fetchAdmins

   // })

  

   return (

      <>
         <AdminList/>
      </>

   )

}

export default Page