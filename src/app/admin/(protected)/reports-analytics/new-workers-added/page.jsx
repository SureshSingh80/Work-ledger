'use client'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/Loader';
import NewWorkersAddedChart from '@/components/NewWorkersAddedChart';
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp';
import { fetchNewWorkersAddedChart } from '@/utils/admin/fetchNewWorkersAddedChart'
import React, { useState } from 'react'

const page = () => {

    const [currentYear , setCurrentYear] = useState(new Date().getFullYear());
    const {data,isLoading,isError,error,refetch} = useQuery({
        queryKey:["new-workers-added", currentYear],
        queryFn:()=>fetchNewWorkersAddedChart(currentYear)
    })

    const year = data?.year || [];
    const newWorkersChart = data?.newWorkersChart || [];
  return (
    <div>
        {
            isLoading ? (
                <Loader />
              ) : isError ? (
                <div className="flex justify-around items-center w-full h-[80vh]">
                  <ReactQueryErrorPopUp error={error} refetch={refetch} />
                </div>
              ) : (
                <NewWorkersAddedChart year={year} newWorkersChart={newWorkersChart}  currentYear={currentYear} setCurrentYear={setCurrentYear} />
              )
        }
    </div>
  )
}

export default page