'use client'
import Loader from '@/components/Loader';
import MonthlyPaymentChart from '@/components/MonthlyPaymentChart';
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp';
import { fetchMonthlyPaymentChart } from '@/utils/admin/fetchMonthlyPaymentChart'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'

const page = () => {

    const [month,setMonth] = useState(new Date().getMonth() + 1); // Default to current month (1-12)

    const {data,isLoading,isError,error,refetch} = useQuery({
        queryKey:["monthly-payments-chart",month],
        queryFn:()=>fetchMonthlyPaymentChart(month)
    })

    const monthlyPayments = data?.monthlyPayments || [];
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
            <MonthlyPaymentChart monthlyPayments={monthlyPayments} month={month} setMonth={setMonth} />
          )
        }
    </div>
  )
}

export default page