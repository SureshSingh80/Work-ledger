"use client";

import React from "react";

const WorkforceReportSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8">

      {/* Heading */}
      <div className="space-y-2">
        <div className="h-8 w-72 rounded bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-200" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-4 h-5 w-24 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Financial Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div className="h-8 w-28 rounded bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Highlight Cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-5 h-5 w-36 rounded bg-gray-200" />

            <div className="mb-3 h-7 w-40 rounded bg-gray-300" />

            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Joining Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-300" />
          </div>
        ))}
      </div>

    </div>
  );
};

export default WorkforceReportSkeleton;