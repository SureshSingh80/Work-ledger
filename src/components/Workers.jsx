'use client'
import { fetchWorkers } from '@/utils/admin/fetchWorkers'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React from 'react'
import Loader from "@/components/Loader"

const Workers = () => {

  const router = useRouter();

  const {data, isLoading, isError, error, refetch} = useQuery({
     queryKey:["workers"],
     queryFn: fetchWorkers
  });


  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">

  {
    isLoading ? <Loader/>:(
       <table className="w-full">

    <thead className="bg-gray-100">

      <tr>

        <th className="px-4 py-3 text-left">Worker</th>
        <th className="px-4 py-3 text-left">Type</th>
        <th className="px-4 py-3 text-left">Daily Wage</th>
        <th className="px-4 py-3 text-left">Attendance</th>
        <th className="px-4 py-3 text-left">Total Earned</th>
        <th className="px-4 py-3 text-left">Pending</th>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">Actions</th>

      </tr>

    </thead>

    <tbody>

      {data?.workers?.map((worker) => (

        <tr
          key={worker._id}
          className="border-t hover:bg-gray-50"
        >

          <td className="px-4 py-3">

            <div>
              <p className="font-medium">
                {worker.name}
              </p>

              <p className="text-sm text-gray-500">
                {worker.mobile}
              </p>
            </div>

          </td>

          <td className="px-4 py-3">
            {worker.workerType}
          </td>

          <td className="px-4 py-3">
            ₹{worker.dailyWage}
          </td>

          <td className="px-4 py-3">
            0 Days
          </td>

          <td className="px-4 py-3">
            ₹0
          </td>

          <td className="px-4 py-3 text-red-600 font-medium">
            ₹0
          </td>

          <td className="px-4 py-3">

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                worker.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {worker.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </td>

          <td className="px-4 py-3">

            <button
              onClick={()=>router.push(`/admin/workers/${worker._id}`)}
              className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              
              View
            </button>

          </td>

        </tr>

      ))}

    </tbody>

  </table>
    )
  }

</div>
  )
}

export default Workers