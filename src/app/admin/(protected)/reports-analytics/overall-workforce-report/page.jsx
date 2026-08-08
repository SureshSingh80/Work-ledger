'use client'
import FetchWorkForceChart from '@/components/FetchWorkForceChart'
import Loader from '@/components/Loader'
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp'
import WorkforceReportSkeleton from '@/components/WorkforceReportSkeleton'
import { fetchOverAllWorkForceChart } from '@/utils/admin/fetchOverAllWorkForceChart'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const page = () => {
  
    const {data, isError, error, isLoading,refetch} = useQuery({
        queryKey:["overall-workforce-report"],
        queryFn:()=>fetchOverAllWorkForceChart()
    });

    const summary = data?.summary || [];
    const highestEarners = data?.highestEarner || [];
    const bestAttendance = data?.bestAttendance || [];
    const highestPending = data?.highestPending || [];
    const joiningStats = data?.joiningStats || [];
  return (
    <div>
               {
            isLoading ? (
                <WorkforceReportSkeleton />
              ) : isError ? (
                <div className="flex justify-around items-center w-full h-[80vh]">
                  <ReactQueryErrorPopUp error={error} refetch={refetch} />
                </div>
              ) : (
                <FetchWorkForceChart summary={summary} highestEarners={highestEarners} bestAttendance={bestAttendance} highestPending={highestPending} joiningStats={joiningStats} />
              )
        }
    </div>
  )
}

export default page