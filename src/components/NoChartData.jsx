import React from "react";
import { BarChart3 } from "lucide-react";

const NoChartData = ({
  title = "No Data Available",
  description = "There is no data available to display",
}) => {
  return (
    <div className=" inset-0 flex items-center justify-center rounded-xl   px-6 text-center">
      <div>
        <div className="mb-5 rounded-full bg-blue-100 p-5 flex items-center justify-center">
          <BarChart3 size={48} className="text-blue-600 flex justify-center" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

          <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default NoChartData;
