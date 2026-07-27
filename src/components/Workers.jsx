'use client'
import { fetchWorkers } from '@/utils/admin/fetchWorkers'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { EyeIcon, PlusIcon, Search, Trash2Icon } from 'lucide-react';
import React, { useState } from 'react'
import Loader from "@/components/Loader"
import { deleteWorker } from '@/utils/admin/deleteWorker'
import ShowResponseData from './ShowResponseData'
import { Loader2 } from 'lucide-react'
import SearchInput from './SearchInput';
import FilterInput from './FilterInput';
import ReactQueryErrorPopUp from './ReactQueryErrorPopUp';

const Workers = () => {

  const router = useRouter();
  const [confirmDelete,setConfirmDelete] = useState(false);
  const [idToDelete,setIdToDelete] = useState('');
  const [deleteError,setDeleteError] = useState('');
  const [loading,setLoading] = useState('');
  const [debouncedSearch,setDebouncedSearch] = useState('');
  const [filterType,setFilterType] = useState('All');


  const {data, isLoading, isError, error, refetch} = useQuery({
     queryKey:['workers',debouncedSearch,filterType],
     queryFn:()=>fetchWorkers({search:debouncedSearch, filter:filterType})
  });

  

  const handleDelete = async() => {
     setLoading('Deleting...');
   
    const res = await deleteWorker(idToDelete);

    if(res.success){
      setDeleteError('');
      setConfirmDelete(false);
      refetch();
    }else{
      console.log("Error in deleting worker", res.error);
      setDeleteError(res.error);
    }
    setLoading('');

  }


  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm mb-2">

       <div className='flex justify-around items-center gap-4 mb-2'>
        <SearchInput setDebouncedSearch={setDebouncedSearch}/>
        <FilterInput setFilterType={setFilterType} />
      </div>
      
  {
    isLoading ? <Loader/> : isError ? <div className='flex justify-around items-center'>
      <ReactQueryErrorPopUp error={error} refetch={refetch}/>
    </div>:(
       <table className={`w-full ${confirmDelete && "blur-sm"}`}>

     <thead className="bg-gray-100">

      <tr>

        <th className="px-12 py-3 text-left">Worker</th>
        <th className="px-12 py-3 text-left">Type</th>
        <th className="px-12 py-3 text-left">Daily Wage</th>
        <th className="px-12 py-3 text-left">Attendance</th>
        <th className="px-12 py-3 text-left">Total Earned</th>
        <th className="px-12 py-3 text-left">Pending</th>
        <th className="px-12 py-3 text-left">Status</th>
        <th className="px-12 py-3 text-left">Actions</th>

      </tr>

    </thead>

    <tbody>

      {data?.workers?.map((worker) => (

        <tr
          key={worker._id}
          className="border-t hover:bg-gray-50"
        >

          <td className="px-12 py-3 ">

            <div>
              <p className="font-medium">
                {worker?.name || "N/A"}
              </p>

              <p className="text-sm text-gray-500">
                {worker?.mobile || "N/A"}
              </p>

              <p className="text-sm text-gray-500">
                    {worker?.joiningDate ? new Date(worker.joiningDate).toLocaleDateString("en-IN", {day: "2-digit", month: "2-digit",year: "numeric",}) : "N/A"}
              </p>
            </div>

          </td>

          <td className="px-12 py-3">
            {worker?.workerType || "N/A"}
          </td>

          <td className="px-12 py-3">
            ₹{worker?.dailyWage || "N/A"}
          </td>

          <td className="px-12 py-3">
            {(worker?.totalPresent || 0) + ((worker?.totalHalfDay || 0) * 0.5)} days
          </td>

          <td className="px-12 py-3">
            ₹{(worker?.totalPresent || 0 + worker?.totalHalfDay * 0.5) * worker?.dailyWage}
          </td>

         <td
            className={`px-12 py-3 font-medium ${
              ((worker?.totalPresent + worker?.totalHalfDay * 0.5) * worker?.dailyWage - (worker?.totalPaid || 0)) < 0
                ? "text-blue-600"
                : ((worker?.totalPresent + worker?.totalHalfDay * 0.5) * worker?.dailyWage - (worker?.totalPaid || 0)) === 0
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            <p>
              ₹
              {(worker?.totalPresent + worker?.totalHalfDay * 0.5) *
                worker?.dailyWage -
                (worker?.totalPaid || 0)}
            </p>

            <p className="text-xs font-medium">
              {((worker?.totalPresent + worker?.totalHalfDay * 0.5) * worker?.dailyWage -
                (worker?.totalPaid || 0)) < 0
                ? "Advance"
                : ((worker?.totalPresent + worker?.totalHalfDay * 0.5) * worker?.dailyWage -
                    (worker?.totalPaid || 0)) === 0
                ? "Settled"
                : "Pending"}
            </p>
          </td>

          <td className="px-12 py-3">

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                worker?.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {worker?.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </td>

          <td className="px-12 py-3">

            <div className='flex '>
                <button
                onClick={()=>{
                  setLoading(worker?._id);
                  router.push(`/admin/workers/${worker?._id}`)
                }}
                className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 mr-2 cursor-pointer"
              >
                
                <span className='flex items-center gap-1'><span className='text-sm'>{loading == worker._id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : 'View'}</span><EyeIcon className="h-3 w-3"/></span>
              </button>

              <button
                onClick={() => {
                  setConfirmDelete(worker?.name);
                  setIdToDelete(worker?._id);
                  setDeleteError('');
                }}
                className="rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700 mr-0 cursor-pointer"
              >
                <span className='flex items-center gap-1'><span className='text-sm'>Delete</span><Trash2Icon className="h-3 w-3"/></span>
              </button>
            </div>

          </td>

        </tr>

      ))}

      {
        data?.workers?.length === 0 && (
          <tr>
            <td colSpan={8} className="px-12 py-3 text-center">
              No Workers Found
            </td>
          </tr>
        )
      }

    </tbody>

  </table>
    )
  }

  {/* confirmation popUp */}
  <div>
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg font-medium text-gray-800">
              Are you sure you want to delete <b>{confirmDelete}</b>?
            </p>
            {deleteError && <p className="text-red-600 mt-2"><ShowResponseData success="" error={deleteError}/></p>}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                {loading == 'Deleting...' ? <Loader2 className="h-4 w-4 animate-spin text-white" />:"Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

  </div>

 

</div>
  )
}

export default Workers