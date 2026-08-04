"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import NoChartData from "./NoChartData";

const AttendanceChart = ({
  attendanceData,
  month,
  setMonth,
}) => {

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const mostPresent = attendanceData[0];
  const leastPresent =
    attendanceData[attendanceData.length - 1];

  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      {/* Heading */}

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Attendance Analysis
        </h2>

        <select
          value={month}
          onChange={(e) =>
            setMonth(Number(e.target.value))
          }
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        >
          {months.map((monthName, index) => (
            <option
              key={monthName}
              value={index + 1}
            >
              {monthName}
            </option>
          ))}
        </select>

      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-4 md:grid-cols-2">

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">

          <p className="text-sm font-semibold text-green-700">
            🏆 Most Present Worker
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {mostPresent?.workerName || "N/A"}
          </h3>

          <p className="text-gray-600">
            {mostPresent?.workedDays ?? 0} Days
          </p>

        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            📉 Least Present Worker
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {leastPresent?.workerName || "N/A"}
          </h3>

          <p className="text-gray-600">
            {leastPresent?.workedDays ?? 0} Days
          </p>

        </div>

      </div>

      {/* Chart */}

      <div className="max-h-[700px] overflow-y-auto">
         <div style={{ height: Math.max(attendanceData.length * 55, 450) }}>

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          {
            attendanceData.length === 0 ? (
                <div className='absolute flex justify-center items-center w-full h-[550px]'>
                    <NoChartData title={"No Data Available"} description={"There is no Attendance data available to display"} />
                </div>
            ):
            (
                <BarChart
                    data={attendanceData}
                    layout="vertical"
                    margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 10,
                    }}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                    type="number"
                    allowDecimals={false}
                    />

                    <YAxis
                    type="category"
                    dataKey="workerName"
                    width={130}
                    />

                    <Tooltip
                    formatter={(value) => [
                        `${value} Days`,
                        "Worked",
                    ]}
                    />

                    <Bar
                    dataKey="workedDays"
                    fill="#2563EB"
                    radius={[0, 6, 6, 0]}
                    />

          </BarChart>
            )
          }

        </ResponsiveContainer>

      </div>
      </div>

    </div>
  );
};

export default AttendanceChart;