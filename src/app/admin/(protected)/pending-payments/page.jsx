'use client'
import React, { useState } from "react";
import PendingPayments from "@/components/PendingPayments";
import { exportPendingPayments } from "@/utils/admin/exportPendingPayments";


const page = () => {


  const handleExport = (format,workerType) =>{
      exportPendingPayments(format,workerType);
  }
  return (
    <div>
       <PendingPayments handleExport = {handleExport}/>
    </div>
  );
};

export default page;
