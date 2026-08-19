"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";

const ExportButton = ({ onExcel, onPdf, disabled = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center gap-2
          rounded-lg
          bg-blue-600
          px-4 py-2
          text-sm font-medium
          text-white
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:opacity-50
          w-full
        "
      >
        <Download size={18} />

        <span>Export</span>

        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            z-50
            mt-2
            w-48
            overflow-hidden
            rounded-lg
            border
            border-gray-200
            bg-white
            shadow-lg
          "
        >

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onExcel?.();
            }}
            className="
              flex w-full items-center gap-3
              px-4 py-3
              text-left text-sm
              text-gray-700
              hover:bg-gray-100
            "
          >
            <FileSpreadsheet
              size={18}
              className="text-green-600"
            />

            <div>
              <p className="font-medium">
                Export Excel
              </p>

              <p className="text-xs text-gray-500">
                .xlsx
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onPdf?.();
            }}
            className="
              flex w-full items-center gap-3
              px-4 py-3
              text-left text-sm
              text-gray-700
              hover:bg-gray-100
            "
          >
            <FileText
              size={18}
              className="text-red-600"
            />

            <div>
              <p className="font-medium">
                Export PDF
              </p>

              <p className="text-xs text-gray-500">
                .pdf
              </p>
            </div>
          </button>

        </div>
      )}

    </div>
  );
};

export default ExportButton;