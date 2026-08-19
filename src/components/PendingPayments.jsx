import React, { useState } from 'react'
import { useQuery } from "@tanstack/react-query";
import { fetchPendingWorkers } from "@/utils/admin/fetchPendingWorkers";
import Loader from "@/components/Loader";
import ReactQueryErrorPopUp from "@/components/ReactQueryErrorPopUp";
import SearchInput from './SearchInput';
import FilterInput from './FilterInput';
import PaymentPopUp from './PaymentPopUp';
import ExportButton from './ExportButton';

const PendingPayments = ({handleExport}) => {

      const [isOpen,setIsOpen] = useState(false);
      const [selectedWorker, setSelectedWorker] = useState(null);

      const [debouncedSearch, setDebouncedSearch] = useState('');
      const [filterType, setFilterType] = useState('All');

    
      const { data, isLoading, isError, refetch, error } = useQuery({
        queryKey: ["pending-payments", debouncedSearch, filterType],
        queryFn: () => fetchPendingWorkers(debouncedSearch, filterType),
      });
      


  return (
    <div className="overflow-hidden rounded-2xl  bg-white shadow-sm">
      <div className=" px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Pending Payment
        </h3>
      </div>

      {/* Search and filter functions */}
      
       <div className='flex flex-col   justify-between md:flex-row md:item-center  gap-4 mb-2 mx-4'>
        <SearchInput setDebouncedSearch={setDebouncedSearch}/>     
         <ExportButton onExcel={() => {
          handleExport("excel",filterType);
         }} onPdf={() => {
          handleExport("pdf",filterType);
         }} /> 
         <FilterInput setFilterType={setFilterType} />
      </div>

     {
       isLoading ? <Loader/> : isError ? <div className='flex justify-center items-center'>
        <ReactQueryErrorPopUp error={error} refetch={refetch} />
       </div> : (
         <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">

            <tr className="text-left text-sm text-gray-600">
              <th className="px-6 py-3">Worker</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Daily Wage</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Worked Days</th>
              <th className="px-6 py-3">Earned</th>
              <th className="px-6 py-3">Paid</th>
              <th className="px-6 py-3">Pending</th>
              <th className="px-6 py-3">Actions</th>
            </tr>

          </thead>

          <tbody>
            {data?.workers.length > 0 ? (
              data?.workers.map((worker) => {
            
                const pendingColor =
                  worker?.pending > 0
                    ? "text-orange-600"
                    : worker?.pending < 0
                    ? "text-blue-600"
                    : "text-green-600";

                return (
                  <tr key={worker._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {worker?.name ?? "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {worker?.mobile ?? "N/A"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {worker?.workerType ?? "N/A"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      ₹{worker?.dailyWage ?? 0}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {worker?.joiningDate
                        ? new Date(worker.joiningDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-700">
                      {worker?.workedDays} days
                    </td>

                    <td className="px-6 py-4 font-medium text-green-700">
                      ₹{worker?.totalEarned ?? 0}
                    </td>

                    <td className="px-6 py-4 font-medium text-blue-700">
                      ₹{worker?.totalPaid ?? 0}
                    </td>

                    <td className={`px-6 py-4 font-bold ${pendingColor}`}>
                      ₹{worker?.pending ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedWorker(worker);
                            setIsOpen(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 cursor-pointer"
                        >
                          Pay Now
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  No pending workers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

     {isOpen && selectedWorker && (
        <PaymentPopUp
          worker={selectedWorker}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          refetch={refetch}
        />
      )}
      </div>
       )
     }
    </div>
  )
}

export default PendingPayments