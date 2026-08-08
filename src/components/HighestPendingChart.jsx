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
  Cell,
} from "recharts";
import NoChartData from "./NoChartData";

const HighestPendingChart = ({ highestPendingData }) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Highest Pending Payments
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Current outstanding balance of every worker (overall).
        </p>
      </div>

      <div className="max-h-[700px] overflow-y-auto">

        <div
          style={{
            height: Math.max(
              highestPendingData.length * 55,
              450
            ),
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {highestPendingData.length === 0 ? (
              <div className="absolute w-full flex h-full items-center justify-center">
                <NoChartData
                  title="No Pending Payments"
                  description="All workers are fully settled."
                />
              </div>
            ) : (
              <BarChart
                data={highestPendingData}
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
                  formatter={(value, name, props) => {
                    const pending = Number(value);

                    return [
                      `${pending >= 0 ? "₹" : "-₹"}${Math.abs(
                        pending
                      ).toLocaleString("en-IN")}`,
                      pending >= 0
                        ? "Pending Amount"
                        : "Advance Paid",
                    ];
                  }}
                />

                <Bar
                  dataKey="pending"
                  radius={[0, 6, 6, 0]}
                >
                  {highestPendingData.map((worker) => (
                    <Cell
                      key={worker.workerId}
                      fill={
                        worker.pending >= 0
                          ? "#DC2626" 
                          : "#16A34A" 
                      }
                    />
                  ))}
                </Bar>

              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default HighestPendingChart;