"use client";

import React from "react";
import {
  Users,
  IndianRupee,
  UserPlus,
  CalendarCheck,
  Wallet,
  TrendingUp,
  PieChart,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const reports = [
  {
    title: "Worker Type Distribution",
    description: "View worker categories using a pie chart.",
    icon: PieChart,
    route: "/admin/reports-analytics/worker-type-distribution",
  },
  {
    title: "Monthly Payments",
    description: "Analyze payments made month-wise.",
    icon: IndianRupee,
    route: "/admin/reports-analytics/monthly-payments",
  },
  {
    title: "New Workers Added",
    description: "See workers joined every month.",
    icon: UserPlus,
    route: "/admin/reports-analytics/new-workers-added",
  },
  {
    title: "Attendance Analysis",
    description: "Most present & least present workers.",
    icon: CalendarCheck,
    route: "/admin/reports-analytics/attendance-analysis",
  },
  {
    title: "Top Earners",
    description: "Workers with maximum earnings.",
    icon: TrendingUp,
    route: "/admin/reports-analytics/top-earners",
  },
  {
    title: "Highest Pending Payments",
    description: "Workers having maximum pending amount.",
    icon: Wallet,
    route: "/admin/reports-analytics/highest-pending-payments",
  },
  {
    title: "Advance Payments",
    description: "Workers who received advance payments.",
    icon: IndianRupee,
    route: "/admin/reports-analytics/advance-payments",
  },
  {
    title: "Overall Workforce Report",
    description: "Complete overview of workers & statistics.",
    icon: Users,
    route: "/admin/reports-analytics/overall-workforce-report",
  },
];

const ReportAnalytics = () => {

    const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Reports & Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          Choose a report to view detailed charts and analysis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report, index) => {
          const Icon = report.icon;

          return (
            <div
              key={index}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              onClick={()=>router.push(report.route)}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                {report.title}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {report.description}
              </p>

              <button
                className="mt-6 flex items-center gap-2 font-medium text-blue-600 transition group-hover:gap-3"
              >
                View Report
                <ArrowRight size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportAnalytics;