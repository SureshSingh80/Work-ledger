"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import NoChartData from "./NoChartData";

const NewWorkersAddedChart = ({
  year,
  newWorkersChart,
  currentYear,
  setCurrentYear,
}) => {

  const years = [];

  for (let y = new Date().getFullYear(); y >= 2020; y--) {
    years.push(y);
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-xl font-bold text-gray-800">
          New Workers Added ({year})
        </h2>

        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          {
            newWorkersChart?.length === 0 ? (
              <div className="absolute w-full flex justify-center items-center h-full">
                <NoChartData title={"No Data Available"} description={"There is no Worker found in this year"} />
              </div>
            ) :
              (
                <BarChart
                data={newWorkersChart}
                margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                dataKey="month"
                />

                <YAxis
                allowDecimals={false}
                />

                <Tooltip
                formatter={(value) => [
                    `${value} Workers`,
                    "Joined",
                ]}
                />

                <Bar
                dataKey="totalWorkers"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                />
            </BarChart>
                )
          }
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default NewWorkersAddedChart;