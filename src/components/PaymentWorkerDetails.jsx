"use client";
import React, { useState } from "react";
import SearchInput from "./SearchInput";
import FilterInput from "./FilterInput";
import { useQuery } from "@tanstack/react-query";
import ReactQueryErrorPopUp from "./ReactQueryErrorPopUp";
import Loader from "./Loader";
import { fetchWorkers } from "@/utils/admin/fetchWorkers";
import PaymentPopUp from "./PaymentPopUp";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const PaymentWorkerDetails = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [loading,setLoading] = useState(false);

  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["workers", debouncedSearch, filterType],
    queryFn: () =>
      fetchWorkers({ search: debouncedSearch, filter: filterType }),
  });

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm mb-2">
      <div className="flex justify-around items-center gap-4 mb-2">
        <SearchInput setDebouncedSearch={setDebouncedSearch} />
        <FilterInput setFilterType={setFilterType} />
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="flex justify-around items-center">
          <ReactQueryErrorPopUp error={error} refetch={refetch} />
        </div>
      ) : (
        <table className={`w-full `}>
          <thead className="bg-gray-100">
            <tr>
              <th className="px-12 py-3 text-left">Worker</th>
              <th className="px-12 py-3 text-left">Type</th>
              <th className="px-12 py-3 text-left">Daily Wage</th>
              <th className="px-12 py-3 text-left">Worked Days</th>
              <th className="px-12 py-3 text-left">Earned</th>
              <th className="px-12 py-3 text-left">Paid</th>
              <th className="px-12 py-3 text-left">Pending</th>
              <th className="px-12 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data?.workers?.map((worker) => (
              <tr key={worker._id} className="border-t hover:bg-gray-50">
                <td className="px-12 py-3 ">
                  <div>
                    <p className="font-medium">{worker.name}</p>

                    <p className="text-sm text-gray-500">{worker.mobile}</p>
                     <p className="text-sm text-gray-500">
                        {worker.joiningDate ? new Date(worker.joiningDate).toLocaleDateString("en-IN", {day: "2-digit", month: "2-digit",year: "numeric",}) : "N/A"}
                    </p>
                  </div>
                </td>

                <td className="px-12 py-3">{worker.workerType}</td>

                <td className="px-12 py-3">₹{worker.dailyWage}</td>

                <td className="px-12 py-3">
                  {worker.totalPresent + worker.totalHalfDay * 0.5} days
                </td>

                <td className="px-12 py-3">
                  ₹
                  {(worker.totalPresent + worker.totalHalfDay * 0.5) *
                    worker.dailyWage}
                </td>

                <td
                  className={`px-12 py-3 font-medium ${
                    (worker.totalPaid || 0) >
                    (worker.totalPresent + worker.totalHalfDay * 0.5) *
                      worker.dailyWage
                      ? "text-blue-600"
                      : (worker.totalPaid || 0) ===
                          (worker.totalPresent + worker.totalHalfDay * 0.5) *
                            worker.dailyWage
                        ? "text-green-600"
                        : "text-orange-600"
                  }`}
                >
                  ₹{worker.totalPaid || 0}
                  {/* <p className="text-xs font-medium">
                    {" "}
                    {(worker.totalPaid || 0) >
                    (worker.totalPresent + worker.totalHalfDay * 0.5) *
                      worker.dailyWage
                      ? "Advance"
                      : (worker.totalPaid || 0) ===
                          (worker.totalPresent + worker.totalHalfDay * 0.5) *
                            worker.dailyWage
                        ? "Settled"
                        : "Pending"}{" "}
                  </p> */}
                </td>

                <td
                  className={`px-12 py-3 font-medium ${
                    (worker.totalPresent + worker.totalHalfDay * 0.5) *
                      worker.dailyWage -
                      (worker.totalPaid || 0) < 0
                      ? "text-blue-600"
                      : (worker.totalPresent + worker.totalHalfDay * 0.5) *
                            worker.dailyWage -
                            (worker.totalPaid || 0) ===
                          0
                        ? "text-green-600"
                        : "text-orange-600"
                  }`}
                >
                  ₹
                  {(worker.totalPresent + worker.totalHalfDay * 0.5) *
                    worker.dailyWage -
                    (worker.totalPaid || 0)}

                  <p className="text-xs font-medium">
                    {" "}
                    {(worker.totalPresent + worker.totalHalfDay * 0.5) *
                      worker.dailyWage -
                      (worker.totalPaid || 0) > 0
                      ? "Pending"
                      : (worker.totalPresent + worker.totalHalfDay * 0.5) *
                            worker.dailyWage -
                            (worker.totalPaid || 0) ===
                          0
                        ? "Settled"
                        : "Advance"}{" "}
                  </p>
                </td>

                <td className="px-12 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedWorker(worker);
                        setIsOpen(true);
                      }}
                      className="bg-green-600 text-white px-4 py-1 rounded-xl cursor-pointer"
                    >
                      Pay
                    </button>
                    <button onClick={()=>{
                      setLoading(worker._id)
                      router.push(`/admin/payments/${worker._id}/history`)
                    }} className="bg-blue-600 text-white px-4 py-1 rounded-xl cursor-pointer">
                     {loading === worker._id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "History"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {data?.workers?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-12 py-3 text-center">
                  No Workers Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {isOpen && selectedWorker && (
        <PaymentPopUp
          worker={selectedWorker}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default PaymentWorkerDetails;
