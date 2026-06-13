'use client'

import { fetchSuperAdmins } from '@/utils/superAdmin/fetchSuperAdmins'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import React, { useState } from 'react'
import { toggleAdminStatus } from '@/utils/superAdmin/toggleAdminStatus'
import Loader from '@/components/Loader'
import ReactQueryErrorPopUp from './ReactQueryErrorPopUp'


const SuperAdminList = () => {

   const   queryClient = useQueryClient();
   // const [currentStatus, setCurrentStatus] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({

      queryKey:["superAdmins"],
      queryFn: fetchSuperAdmins

   });

   const mutation = useMutation({
      mutationFn: (id) => toggleAdminStatus(id),

      // means before the mutation function runs, we can optimistically update our UI
       onMutate: async (id) => {

      // Stop ongoing refetches(fetchAdmin while toggling status) to prevent overwriting our optimistic update
      await queryClient.cancelQueries({
         queryKey: ["superAdmins"]
      });

      // Previous cached data (if api failed need old state back)
      const previousSuperAdmins = queryClient.getQueryData(["superAdmins"]);

      // Optimistically update cache
      queryClient.setQueryData(["superAdmins"], (oldData) => {

         return oldData.map((superAdmin) =>
            superAdmin._id === id
               ? { ...superAdmin, isActive: !superAdmin.isActive }
               : superAdmin
         );

      });

      // Return previous data for rollback
      return { previousSuperAdmins };
   },

   onError: (err, id, context) => {

      // Rollback if API fails
      queryClient.setQueryData(
         ["superAdmins"],
         context.previousSuperAdmins
      );
   },

   onSettled: () => {

      // Final sync with server
      queryClient.invalidateQueries({
         queryKey: ["superAdmins"]
      });

    }
   })

   const toggleStatus = (id)=>{
      mutation.mutate(id);
   }


  return (
     <div className='min-h-screen bg-gray-100 p-4'>

         {
            isLoading ? (
              <Loader/>
            ) : isError ? (
              <div className="flex items-center justify-center min-h-screen">
                    <ReactQueryErrorPopUp error={error} refetch={refetch}/>

              </div>
            ) : data?.length === 0 ? (
                 <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="text-7xl mb-3">📭</div>
                    <h3 className="text-2xl font-semibold text-gray-700">
                    No Super Admins Found
                    </h3>
                    <p className="text-cl text-gray-500 mt-1">
                    There are currently no super admin accounts available.
                    </p>
                </div>
            ):(
               <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>

            { data?.map(superAdmin => (

               <div
                  key={superAdmin._id}
                  className='bg-white shadow-md rounded-xl p-4 border'
               >

                  <h2 className='text-lg font-semibold text-gray-600'>
                     Username: {superAdmin.username}
                  </h2>


                  <p className='text-gray-600'>
                     Email: {superAdmin.email}
                  </p>

                  <div className='mt-2 text-sm text-gray-600'>

                     <span className='font-medium'>Role: </span>
                     {superAdmin.role}

                  </div>

                  <div className='text-sm text-gray-600 mt-1 flex  justify-between gap-2'>

                    <div>

                    <span className='font-medium'>Status:</span>

                     <span
                        className={`ml-1 ${
                           superAdmin.isActive
                           ? "text-green-600"
                           : "text-red-500"
                        }`}
                     >

                        {superAdmin.isActive ? "Active" : "Inactive"}

                     </span>

                    </div>
                    
                   
                        <div className='flex items-center space-x-2'>
                            <Switch  className="ml-4 cursor-pointer" checked={superAdmin.isActive} onCheckedChange={()=>toggleStatus(superAdmin._id)}   />
                            <Label  className="ml-2 text-sm text-gray-600">
                                Toggle Status
                            </Label>
                        </div>
                    
                     

                  </div>

                  <p className='text-xs text-gray-600 mt-2 '>

                     Created: {new Date(superAdmin.createdAt).toLocaleDateString()}

                  </p>

               </div>

            ))}

           
         </div>
            )
         }


      </div>
  )
}

export default SuperAdminList