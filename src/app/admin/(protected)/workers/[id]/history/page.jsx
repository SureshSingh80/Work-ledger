"use client";
import AttendanceHistory from "@/components/AttendanceHistory";
import Loader from "@/components/Loader";
import ReactQueryErrorPopUp from "@/components/ReactQueryErrorPopUp";
import { fetchAttendanceHistory } from "@/utils/admin/fetchAttendanceHistory";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const { id } = useParams();

  const [month, setMonth] = useState("");
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["attendance-history", id, month],
    queryFn: () => fetchAttendanceHistory(id, month),
  });

  const history = data?.history || [];
  const worker = data?.worker || {};
  const summary = data?.summary || {
    totalPresent: 0,
    totalAbsent: 0,
    totalHalfDay: 0,
  };
  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="flex justify-around items-center w-full h-[80vh]">
          <ReactQueryErrorPopUp error={error} refetch={refetch} />
        </div>
      ) : (
        <AttendanceHistory
          worker={worker}
          attendanceHistory={history}
          totalPresent={summary.totalPresent}
          totalAbsent={summary.totalAbsent}
          totalHalfDay={summary.totalHalfDay}
          month={month}
          setMonth={setMonth}
        />
      )}
    </div>
  );
};

export default page;
