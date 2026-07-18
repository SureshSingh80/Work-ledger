'use client'
import React, { useState } from 'react'
import SearchInput from './SearchInput'
import FilterInput from './FilterInput'
import { useQuery } from '@tanstack/react-query'
import ReactQueryErrorPopUp from './ReactQueryErrorPopUp'
import Loader from './Loader'
import { fetchWorkers } from '@/utils/admin/fetchWorkers'
import PaymentPopUp from './PaymentPopUp'

const PaymentWorkerDetails = () => {

  const [debouncedSearch,setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
    const [filterType,setFilterType] = useState('All');

    const {data, isLoading, isError, error, refetch} = useQuery({
     queryKey:['workers',debouncedSearch,filterType],
     queryFn:()=>fetchWorkers({search:debouncedSearch, filter:filterType})
  });

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
       <table className={`w-full `}>

      <thead className="bg-gray-100">

      <tr>

        <th className="px-12 py-3 text-left">Worker</th>
        <th className="px-12 py-3 text-left">Type</th>
        <th className="px-12 py-3 text-left">Daily Wage</th>
        <th className="px-12 py-3 text-left">Worked Days</th>
        <th className="px-12 py-3 text-left">Earned</th>
        <th className="px-12 py-3 text-left">Paid</th>
        <th className="px-12 py-3 text-left">Pending</th>
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
                {worker.name}
              </p>

              <p className="text-sm text-gray-500">
                {worker.mobile}
              </p>
            </div>

          </td>

          <td className="px-12 py-3">
            {worker.workerType}
          </td>

          <td className="px-12 py-3">
            ₹{worker.dailyWage}
          </td>

          <td className="px-12 py-3">
            {worker.totalPresent + (worker.totalHalfDay * 0.5)} days
          </td>

          <td className="px-12 py-3">
            ₹{(worker.totalPresent + worker.totalHalfDay * 0.5) * worker.dailyWage}
          </td>

          <td className="px-12 py-3 text-red-600 font-medium">
            ₹{worker.totalPaid || 0}
          </td>

          <td className="px-12 py-3">

            ₹ {(worker.totalPresent + worker.totalHalfDay * 0.5) * worker.dailyWage - (worker.totalPaid || 0)}

          </td>

          <td className="px-12 py-3">
            <div className='flex gap-2'>
                <button onClick={()=>{
                  setSelectedWorker(worker);
                  setIsOpen(true);
                }} className='bg-green-600 text-white px-4 py-1 rounded-xl cursor-pointer'>Pay</button>
                <button className='bg-blue-600 text-white px-4 py-1 rounded-xl cursor-pointer'>History</button>
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
    {
        isOpen && selectedWorker && (
          <PaymentPopUp worker={selectedWorker} isOpen={isOpen} setIsOpen={setIsOpen} refetch={refetch}/>
        )
    }
    </div>
  )
}

export default PaymentWorkerDetails