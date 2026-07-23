import React, { useState } from 'react'
import { Pencil } from 'lucide-react';
import EditWorkerForm from './EditWorkerForm';

const WorkerDetails = ({worker, totalPresent, totalHalfDays, totalPaid, refetch}) => {

    const [isEditing,setIsEditing] = useState(false);
  return (
     <div className="mx-auto max-w-4xl p-6">

     {
       isEditing ? (
        <EditWorkerForm worker={worker} isEditing={isEditing} setIsEditing={setIsEditing} refetch={refetch}/>
       ):
       (
         <div className="overflow-hidden rounded-2xl border bg-white shadow-md">

        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {worker.name}
            </h1>

            <p className="text-gray-500">
              {worker.workerType}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              worker.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {worker.isActive ? 'Active' : 'Inactive'}
          </span>

        </div>

        {/* Details */}
        <div className="grid gap-6 p-6 md:grid-cols-2">

          <div>
            <p className="text-sm text-gray-500">Mobile Number</p>
            <p className="font-medium">{worker.mobile || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Daily Wage</p>
            <p className="font-medium">₹{worker.dailyWage}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Joining Date</p>
            <p className="font-medium">
              {new Date(worker.joiningDate).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Worker Type</p>
            <p className="font-medium">{worker.workerType}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">
              {worker.address || 'Not Provided'}
            </p>
          </div>

        </div>

        {/* Summary Section */}
        <div className="grid gap-4 border-t bg-gray-50 p-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Attendance
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              {totalPresent + totalHalfDays * 0.5} days
            </h3>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Earned
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              ₹{(totalPresent + totalHalfDays * 0.5) * worker.dailyWage}  
            </h3>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Amount
            </p>
            <h3
              className={`mt-1 text-2xl font-bold ${
                ((totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)) < 0
                  ? "text-blue-600"
                  : ((totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)) === 0
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              ₹{(totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)}
            </h3>

            <p
              className={`mt-1 text-sm font-medium ${
                ((totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)) < 0
                  ? "text-blue-600"
                  : ((totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)) === 0
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {((totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)) < 0
                ? "Advance"
                : ((totalPresent + totalHalfDays * 0.5) * worker.dailyWage - (totalPaid || 0)) === 0
                ? "Settled"
                : "Pending"}
            </p>
          </div>

        </div>

        {/* Edit */}
        <div className="flex justify-end border-t p-6">

          <button
            onClick={() =>
              setIsEditing(true)
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            <Pencil size={18} />
            Edit Worker
          </button>

        </div>

      </div>
       )
     }

    </div>
  )
}

export default WorkerDetails