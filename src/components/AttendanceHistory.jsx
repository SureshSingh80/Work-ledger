'use client';
import React, { useState } from "react";
import ExportButton from "./ExportButton";
import { exportAttendanceHistory } from "@/utils/admin/exportAttendanceHistory";
import { useQuery } from "@tanstack/react-query";

const AttendanceHistory = ({
  worker,
  attendanceHistory,
  totalPresent,
  totalAbsent,
  totalHalfDay,
  month,
  setMonth,
  handleExport,
}) => {

    
    const totalDays = totalPresent + totalAbsent + totalHalfDay;

    const attendancePercentage =
      totalDays === 0
        ? 0
        : ((totalPresent + totalHalfDay * 0.5) / totalDays) * 100;
  return (
    <div className="space-y-6">

     <div className="flex flex-col justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center">

        {/* Worker Info */}
        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            {worker?.name}
          </h1>

          <p className="mt-1 text-sm font-medium text-gray-500">
            {worker?.workerType}
          </p>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">

            <div>
              <span className="font-semibold text-gray-700">
                Daily Wage:
              </span>{" "}
              <span className="text-gray-900">
                ₹{worker?.dailyWage}
              </span>
            </div>

            <div>
              <span className="font-semibold text-gray-700">
                Joining Date:
              </span>{" "}
              <span className="text-gray-900">
                {new Date(worker?.joiningDate).toLocaleDateString("en-IN")}
              </span>
            </div>

          </div>

        </div>

        {/* Export functionality */}

        <ExportButton onExcel = {()=>{
          handleExport("excel");
        }} onPdf = {()=>{
          handleExport("pdf");
        }} />

        {/* Month Filter */}

        <div className="w-full md:w-60">

          <label
            htmlFor="month"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Filter by Month
          </label>

          <select
            id="month"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

        </div>

      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-xl bg-green-100 p-5">

          <p className="text-sm text-gray-700">
            Total Present
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {totalPresent}
          </h2>

        </div>

        <div className="rounded-xl bg-red-100 p-5">

          <p className="text-sm text-gray-700">
            Total Absent
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-700">
            {totalAbsent}
          </h2>

        </div>

        <div className="rounded-xl bg-yellow-100 p-5">

          <p className="text-sm text-gray-700">
            Half Days
          </p>

          <h2 className="mt-2 text-3xl font-bold text-yellow-700">
            {totalHalfDay}
          </h2>

        </div>

         <div className="rounded-xl bg-green-100 p-5">

          <p className="text-sm text-gray-700">
            Total Present Percentage
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {attendancePercentage.toFixed(2)}%
          </h2>

        </div>

      </div>

      {/* History */}

      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-5 py-3 text-left">
                Date
              </th>

              <th className="px-5 py-3 text-left">
                Day
              </th>

              <th className="px-5 py-3 text-left">
                Status
              </th>

              <th className="px-5 py-3 text-left">
                Overtime
              </th>

              <th className="px-5 py-3 text-left">
                Note
              </th>

            </tr>

          </thead>

          <tbody>

            {attendanceHistory.map((record) => {

              const date = new Date(record.attendanceDate);

              return (

                <tr
                  key={record._id}
                  className="border-t"
                >

                  <td className="px-5 py-4">
                    {date.toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    {date.toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium
                      ${
                        record.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : record.status === "Absent"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {record.status}
                    </span>

                  </td>

                  <td className="px-5 py-4">
                    {record.overtimeHours || 0} hrs
                  </td>

                  <td className="px-5 py-4">
                    {record.note || "-"}
                  </td>

                </tr>

              );

            })}

            {
              attendanceHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-4 text-center">
                    No records found.
                  </td>
                </tr>
              )
            }

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AttendanceHistory;