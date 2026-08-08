"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  IndianRupee,
  TrendingUp,
  Calendar,
  Trophy,
  Clock,
  AlertTriangle,
} from "lucide-react";

const FetchWorkForceChart = ({
  summary,
  highestEarners,
  bestAttendance,
  highestPending,
  joiningStats,
}) => {
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon className={color} size={22} />
      </div>

      <h2 className="mt-3 text-2xl font-bold text-gray-800">
        {value}
      </h2>
    </div>
  );

  const HighlightCard = ({ icon: Icon, title, name, value, color }) => (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={color} size={20} />
        <h3 className="font-semibold text-gray-800">
          {title}
        </h3>
      </div>

      <p className="text-lg font-bold text-gray-900">
        {name || "-"}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {value}
      </p>
    </div>
  );

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Overall Workforce Report
        </h1>

        <p className="text-gray-500 mt-1">
          Complete overview of your workforce.
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={Users}
          title="Total Workers"
          value={summary?.totalWorkers ?? 0}
          color="text-blue-600"
        />

        <StatCard
          icon={UserCheck}
          title="Active Workers"
          value={summary?.activeWorkers ?? 0}
          color="text-green-600"
        />

        <StatCard
          icon={UserX}
          title="Inactive Workers"
          value={summary?.inactiveWorkers ?? 0}
          color="text-red-500"
        />

        <StatCard
          icon={IndianRupee}
          title="Average Daily Wage"
          value={`₹${Number(
            summary?.averageDailyWage || 0
          ).toLocaleString("en-IN")}`}
          color="text-orange-500"
        />

      </div>

      {/* Financial Summary */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <StatCard
          icon={TrendingUp}
          title="Total Earned"
          value={`₹${Number(
            summary?.totalEarned || 0
          ).toLocaleString("en-IN")}`}
          color="text-blue-600"
        />

        <StatCard
          icon={IndianRupee}
          title="Total Paid"
          value={`₹${Number(
            summary?.totalPaid || 0
          ).toLocaleString("en-IN")}`}
          color="text-green-600"
        />

        <StatCard
          icon={AlertTriangle}
          title="Total Pending"
          value={`₹${Number(
            summary?.totalPending || 0
          ).toLocaleString("en-IN")}`}
          color="text-red-600"
        />

      </div>

      {/* Highlights */}

      <div className="grid gap-5 lg:grid-cols-3">

        <HighlightCard
          icon={Trophy}
          title="Highest Earner"
          name={highestEarners?.workerName}
          value={`₹${Number(
            highestEarners?.totalEarned || 0
          ).toLocaleString("en-IN")}`}
          color="text-yellow-500"
        />

        <HighlightCard
          icon={Clock}
          title="Best Attendance"
          name={bestAttendance?.workerName}
          value={`${bestAttendance?.totalPresent || 0} Present Days`}
          color="text-blue-600"
        />

        <HighlightCard
          icon={AlertTriangle}
          title="Highest Pending"
          name={highestPending?.workerName}
          value={`₹${Number(
            highestPending?.pending || 0
          ).toLocaleString("en-IN")}`}
          color="text-red-600"
        />

      </div>

      {/* Joining Stats */}

      <div className="grid gap-5 md:grid-cols-2">

        <StatCard
          icon={Calendar}
          title="Joined This Year"
          value={joiningStats?.joinedThisYear ?? 0}
          color="text-indigo-600"
        />

        <StatCard
          icon={Calendar}
          title="Joined This Month"
          value={joiningStats?.joinedThisMonth ?? 0}
          color="text-emerald-600"
        />

      </div>

    </div>
  );
};

export default FetchWorkForceChart;