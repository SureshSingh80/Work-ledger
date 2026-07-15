'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import SearchInput from './SearchInput';
import FilterInput from './FilterInput';
import { useQuery } from '@tanstack/react-query';
import Loader from './Loader';
import ShowResponseData from './ShowResponseData';
import ReactQueryErrorPopUp from './ReactQueryErrorPopUp';
import { fetchAttendanceWorkers } from '@/utils/admin/fetchAttendanceWorkers';
import { fetchWorkers } from '@/utils/admin/fetchWorkers';
import { markAttendance } from '@/utils/admin/markAttendance';
import { useRouter } from 'next/navigation';


const AttendancePage = () => {

  const router = useRouter();
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingAttendanceError, setMarkingAttendanceError] = useState(null);
  const [markingAttendanceSuccess, setMarkingAttendanceSuccess] = useState(null);

  const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ['workers', debouncedSearch, filterType, selectedDate],
    queryFn: () => fetchAttendanceWorkers({search: debouncedSearch, filter: filterType,  selectedDate})
  });

      const totalPresent =
        data?.workers.filter(
            w => w.todayAttendance?.status === "Present"
        ).length;

    const totalAbsent =
        data?.workers.filter(
            w => w.todayAttendance?.status === "Absent"
        ).length;

    const totalHalfDay =
        data?.workers.filter(
            w => w.todayAttendance?.status === "Half Day"
        ).length;

    const totalNotMarked =
        data?.workers.filter(
            w => !w.todayAttendance
        ).length;

 

  const handleStatusChange = async(id, value) => {
      setMarkingAttendanceError(null);
      const res = await markAttendance(id, value, selectedDate);
      if(res.success){
        setMarkingAttendanceSuccess(res.data.message);
        setTimeout(() => {
          setMarkingAttendanceSuccess(null);
        }, 3000);
        refetch();
      }else{
        setMarkingAttendanceError(res.error);
        console.log("Error in marking attendance", res.error);
      }
  };

  const getStatusBadge = (status) => {

    switch (status) {

      case "Present":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={14} />
            Present
          </span>
        );

      case "Absent":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={14} />
            Absent
          </span>
        );

      case "Half Day":
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            <Clock3 size={14} />
            Half Day
          </span>
        );

      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            Not Marked
          </span>
        );
    }

  };

  return (

    <div className="p-6">

      {/* Heading */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Attendance Management
          </h1>

          <p className="text-gray-500 mt-1">
            Mark today's attendance
          </p>

        </div>

        <div>
          {markingAttendanceError && (
            <ShowResponseData
              error={markingAttendanceError}
            />
          )}
          {
            markingAttendanceSuccess && (
              <ShowResponseData
                success={markingAttendanceSuccess}
              />
            )
          }
        </div>

        <div>
          <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
             setMarkingAttendanceError(null);
          }}
          className="rounded-lg border px-4 py-2"
        />
        </div>

      </div>

      {/* Search */}

       <div className='flex justify-between items-center gap-4 mb-2'>
        <SearchInput setDebouncedSearch={setDebouncedSearch}/>
        <FilterInput setFilterType={setFilterType} />
      </div>

      {/* Table */}

      <div className="overflow-x-auto rounded-xl border shadow-sm">

       {
        isLoading ? <Loader/> : isError ? <div className='flex justify-around items-center'>
       <ReactQueryErrorPopUp error={error} refetch={refetch}/>
      </div>  : (
           <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-6 py-3 text-left">
                Worker
              </th>

              <th className="px-6 py-3 text-left">
                Type
              </th>

              <th className="px-6 py-3 text-left">
                Wage
              </th>

              <th className="px-6 py-3 text-left">
                Today's Status
              </th>

              <th className="px-6 py-3 text-left">
                Mark Attendance
              </th>

              <th className="px-6 py-3 text-left">
                History
              </th>

            </tr>

          </thead>

          <tbody>

            {data?.workers?.map(worker => (

              <tr
                key={worker._id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-6 py-4">

                  <p className="font-semibold">
                    {worker.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {worker.mobile}
                  </p>

                </td>

                <td className="px-6 py-4">
                  {worker.workerType}
                </td>

                <td className="px-6 py-4">
                  ₹{worker.dailyWage}
                </td>

                <td className="px-6 py-4">
                  {getStatusBadge(worker?.todayAttendance?.status)}
                </td>

                <td className="px-6 py-4">

                  <select
                    value={worker.todayAttendance?.status ?? "Mark Attendance"}
                    onChange={(e) =>
                      handleStatusChange(worker._id, e.target.value)
                    }
                   
                    className="rounded-lg border px-3 py-2"
                  >
                    <option disabled>
                      Mark Attendance
                    </option>

                     <option>
                      Absent
                    </option>

                    <option>
                      Present
                    </option>

                    <option>
                      Half Day
                    </option>

                   

                  </select>

                </td>

                <td className="px-6 py-4">

                  <button onClick={ () => router.push(`/admin/workers/${worker._id}/history`)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                     Go to History
                  </button>

                </td>

              </tr>

            ))}

             {
                data?.workers?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-12 py-3 text-center">
                      No Workers Found
                    </td>
                  </tr>
                )
             }

          </tbody>

        </table>
        )
       }

      </div>

      {/* Summary */}

      <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium">

        <span>
          Total Workers : <strong>{data?.workers.length}</strong>
        </span>

        <span className="text-green-600">
          Present : <strong>{totalPresent}</strong>
        </span>

        <span className="text-red-600">
          Absent : <strong>{totalAbsent}</strong>
        </span>

        <span className="text-yellow-600">
          Half Day : <strong>{totalHalfDay}</strong>
        </span>

        <span className="text-gray-600">
          Not Marked : <strong>{totalNotMarked}</strong>
        </span>

      </div>

    </div>
  );
};

export default AttendancePage;