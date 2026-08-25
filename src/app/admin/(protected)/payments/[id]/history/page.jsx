"use client";
import Loader from "@/components/Loader";
import PaymentHistory from "@/components/PaymentHistory";
import ReactQueryErrorPopUp from "@/components/ReactQueryErrorPopUp";
import { exportPaymentHistory } from "@/utils/admin/exportPaymentHistory";
import { fetchPaymentHistory } from "@/utils/admin/fetchPaymentHistory";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const page = () => {

  const { id } = useParams();

  const [month, setMonth] = useState('');
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["payment-history", id, month],
    queryFn: () => fetchPaymentHistory(id,month),
  });

  const handleExport = (format)=>{
     exportPaymentHistory(id, month, format);
  }

  const worker = data?.worker;
  const summary = data?.summary;
  const paymentHistory = data?.paymentHistory;


  return <div>
     {
       isLoading ? (
         <Loader />
       ) : isError ? (
         <div className="flex justify-around items-center w-full h-[80vh]">
           <ReactQueryErrorPopUp error={error} refetch={refetch} />
         </div>
       ) : (
         <PaymentHistory
           worker={worker}
           summary={summary}
           paymentHistory={paymentHistory}
           month={month}
           setMonth={setMonth}
           handleExport={handleExport}
           refetch={refetch}
         />
       )
     }
  </div>;
};

export default page;
