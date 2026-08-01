'use client'
import Loader from "@/components/Loader";
import ReactQueryErrorPopUp from "@/components/ReactQueryErrorPopUp";
import WorkerTypeChart from "@/components/WorkerTypeChart";
import { fetchWorkerTypeChart } from "@/utils/admin/fetchWorkerTypeChart";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const page = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["worker-type-chart"],
    queryFn: () => fetchWorkerTypeChart(),
  });

  const workerTypes = data?.workerTypes || [];
  return <div>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="flex justify-around items-center w-full h-[80vh]">
          <ReactQueryErrorPopUp error={error} refetch={refetch} />
        </div>
      ) : (
        <WorkerTypeChart workerTypes={workerTypes} />
      )}
  </div>;
};

export default page;
