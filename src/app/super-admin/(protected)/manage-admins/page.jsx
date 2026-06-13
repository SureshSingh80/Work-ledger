'use client'

import AdminList from '@/components/AdminList'
import { fetchAdmins } from '@/utils/superAdmin/fetchAdmins'
import { useQuery } from '@tanstack/react-query'

const Page = () => {

  

  

   return (

      <>
         <AdminList/>
      </>

   )

}

export default Page