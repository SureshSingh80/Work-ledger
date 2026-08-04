'use client'
import AttendanceChart from '@/components/AttendanceChart';
import Loader from '@/components/Loader';
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp';
import { fetchAttendanceChart } from '@/utils/admin/fetchAttendanceChart';
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'

const page = () => {

    const [month,setMonth] = useState(new Date().getMonth()+1);

    const {data,isLoading,isError,error} = useQuery({
        queryKey:["attendanceChart",month],
        queryFn:()=>fetchAttendanceChart(month)
    });

    const attendanceData = data?.attendanceAnalysis || [];

  return (
    <div>
        {
            isLoading ? (
                <Loader />
              ) : isError ? (
                <div className="flex justify-around items-center w-full h-[80vh]">
                  <ReactQueryErrorPopUp error={error} />
                </div>
              ) : (
                <AttendanceChart attendanceData={attendanceData} month={month} setMonth={setMonth} />
              )
        }
    </div>
  )
}

export default page