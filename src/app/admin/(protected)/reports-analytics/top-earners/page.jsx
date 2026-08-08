'use client'
import Loader from '@/components/Loader';
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp';
import TopEarnersChart from '@/components/TopEarnersChart';
import { fetchTopEarnersChart } from '@/utils/admin/fetchTopEarnersChart';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'

const page = () => {

    const [month,setMonth] = useState(0);

    const {data,isLoading,isError,error,refetch} = useQuery({
        queryKey:["topEarnersChart",month],
        queryFn:()=>fetchTopEarnersChart(month)
    });
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
                <TopEarnersChart topEarnersData={data?.topEarners || []} month={month} setMonth={setMonth} />
              )
        }
    </div>
  )
}

export default page