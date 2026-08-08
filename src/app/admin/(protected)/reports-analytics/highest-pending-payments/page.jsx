'use client'
import HighestPendingChart from '@/components/HighestPendingChart';
import Loader from '@/components/Loader';
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp';
import { fetchHighestPendingChart } from '@/utils/admin/fetchHighestPendingChart';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

const page = () => {

    const {data,isLoading,isError,error,refetch} = useQuery({
        queryKey:["highestPendingChart"],
        queryFn:fetchHighestPendingChart
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
                <HighestPendingChart highestPendingData={data?.highestPendingData || []} />
              )
        }
    </div>
  )
}

export default page