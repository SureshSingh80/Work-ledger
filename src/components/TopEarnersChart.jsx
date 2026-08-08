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

const months = [
  { value: 0, label: "All Time" },
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const TopEarnersChart = ({
  topEarnersData,
  month,
  setMonth,
}) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-xl font-bold text-gray-800">
          Top Earners
        </h2>

        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

      </div>

      {/* Chart */}

      <div className="max-h-[700px] overflow-y-auto">

        <div
          style={{
            height: Math.max(
              topEarnersData.length * 55,
              450
            ),
          }}
        >

          <ResponsiveContainer width="100%" height="100%">

            {topEarnersData.length === 0 ? (

              <div className="absolute flex h-full w-full items-center justify-center">
                <NoChartData
                  title="No Data Available"
                  description="No earnings data found for the selected month."
                />
              </div>

            ) : (

              <BarChart
                data={topEarnersData}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 40,
                  bottom: 20,
                }}
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <YAxis
                  type="category"
                  dataKey="workerName"
                  width={140}
                />

                <Tooltip
                  formatter={(value, name, props) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    props.payload.workerName,
                  ]}
                />

                <Bar
                  dataKey="totalEarned"
                  fill="#16A34A"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>

            )}

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
};

export default TopEarnersChart;