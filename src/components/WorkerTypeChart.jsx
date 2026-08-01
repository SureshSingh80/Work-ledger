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

const WorkerTypeChart = ({ workerTypes }) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow border">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Worker Type Distribution
      </h2>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={workerTypes}
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="workerType"
              tick={{ fontSize: 13 }}
            />

            <YAxis allowDecimals={false} />

            <Tooltip
              formatter={(value) => [`${value} Workers`, "Count"]}
            />

            <Bar
              dataKey="totalWorkers"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkerTypeChart;