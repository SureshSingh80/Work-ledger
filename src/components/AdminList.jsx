'use client'

import { fetchAdmins } from '@/utils/superAdmin/fetchAdmins'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import React, { useState } from 'react'
import { toggleAdminStatus } from '@/utils/superAdmin/toggleAdminStatus'


const AdminList = () => {

   const   queryClient = useQueryClient();
   // const [currentStatus, setCurrentStatus] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({

      queryKey:["admins"],
      queryFn: fetchAdmins

   });

   const mutation = useMutation({
      mutationFn: (id) => toggleAdminStatus(id),

      // means before the mutation function runs, we can optimistically update our UI
       onMutate: async (id) => {

      // Stop ongoing refetches(fetchAdmin while toggling status) to prevent overwriting our optimistic update
      await queryClient.cancelQueries({
         queryKey: ["admins"]
      });

      // Previous cached data (if api failed need old state back)
      const previousAdmins = queryClient.getQueryData(["admins"]);

      // Optimistically update cache
      queryClient.setQueryData(["admins"], (oldData) => {

         return oldData.map((admin) =>
            admin._id === id
               ? { ...admin, isActive: !admin.isActive }
               : admin
         );

      });

      // Return previous data for rollback
      return { previousAdmins };
   },

   onError: (err, id, context) => {

      // Rollback if API fails
      queryClient.setQueryData(
         ["admins"],
         context.previousAdmins
      );
   },

   onSettled: () => {

      // Final sync with server
      queryClient.invalidateQueries({
         queryKey: ["admins"]
      });

    }
   })

   const toggleStatus = (id)=>{
      mutation.mutate(id);
   }


  return (
     <div className='min-h-screen bg-gray-100 p-4'>

         <h1 className='text-2xl text-black font-bold mb-6 text-center'>
            Admin List
         </h1>

         {
            isLoading ? (
               <p className='text-center text-gray-500'>Loading admins...</p>
            ) : isError ? (
               <p className='text-center text-red-500'>{error.message}</p> 
            ) : (
               <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>

            {data?.map(admin => (

               <div
                  key={admin._id}
                  className='bg-white shadow-md rounded-xl p-4 border'
               >

                  <h2 className='text-lg font-semibold text-gray-600'>
                     Username: {admin.username}
                  </h2>


                  <p className='text-gray-600'>
                     Email: {admin.email}
                  </p>

                  <div className='mt-2 text-sm text-gray-600'>

                     <span className='font-medium'>Role: </span>
                     {admin.role}

                  </div>

                  <div className='text-sm text-gray-600 mt-1 flex  justify-between gap-2'>

                    <div>

                    <span className='font-medium'>Status:</span>

                     <span
                        className={`ml-1 ${
                           admin.isActive
                           ? "text-green-600"
                           : "text-red-500"
                        }`}
                     >

                        {admin.isActive ? "Active" : "Inactive"}

                     </span>

                    </div>
                    
                   
                        <div className='flex items-center space-x-2'>
                            <Switch  className="ml-4 cursor-pointer" checked={admin.isActive} onCheckedChange={()=>toggleStatus(admin._id)}   />
                            <Label  className="ml-2 text-sm text-gray-600">
                                Toggle Status
                            </Label>
                        </div>
                    
                     

                  </div>

                  <p className='text-xs text-gray-600 mt-2 '>

                     Created: {new Date(admin.createdAt).toLocaleDateString()}

                  </p>

               </div>

            ))}

         </div>
            )
         }

      </div>
  )
}

export default AdminList