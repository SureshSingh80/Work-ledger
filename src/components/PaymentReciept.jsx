"use client";

import {
    X,
    Printer,
    IndianRupee,
    CalendarDays,
    CreditCard,
    User,
    FileText,
    Hash,
} from "lucide-react";

import { formatISTDate } from "@/lib/dateUtils";
import handlePrintReceipt from "@/utils/admin/handlePrintReceipt";

const PaymentReciept = ({
    printableData,
    setPrintableData,
}) => {

    const handlePrint=() => {
        handlePrintReceipt(printableData);
    }

   
    if (!printableData) return null;

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50
                p-4
            "
        >
            <div
                className="
                    w-full max-w-md
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >
                {/* ---------------- Header ---------------- */}

                <div
                    className="
                        flex items-center justify-between
                        border-b
                        px-5 py-4
                    "
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Payment Details
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            View payment information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={()=>setPrintableData(null)}
                        className="
                            rounded-lg p-2
                            text-gray-500
                            transition
                            hover:bg-gray-100
                            hover:text-gray-800
                            cursor-pointer
                        "
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* ---------------- Amount ---------------- */}

                <div className="border-b bg-gray-50 px-5 py-5 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Payment Amount
                    </p>

                    <div className="mt-1 flex items-center justify-center">
                        <IndianRupee
                            size={24}
                            className="text-green-600"
                        />

                        <span className="text-3xl font-bold text-gray-900">
                            {Number(
                                printableData.payment.amount || 0
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </span>
                    </div>
                </div>

                {/* ---------------- Details ---------------- */}

                <div className="space-y-4 px-5 py-5">

                    {/* Worker */}

                    <DetailRow
                        icon={User}
                        label="Worker"
                        value={
                            printableData.worker?.name ||
                            "-"
                        }
                    />

                    {/* Worker Type */}

                    {(printableData.worker?.workerType) && (
                        <DetailRow
                            icon={User}
                            label="Worker Type"
                            value={
                                printableData.worker?.workerType ||
                                "-"
                            }
                        />
                    )}

                    {/* Date */}

                    <DetailRow
                        icon={CalendarDays}
                        label="Payment Date"
                        value={
                            printableData.payment.paymentDate
                                ? formatISTDate(
                                      printableData.payment.paymentDate
                                  )
                                : "-"
                        }
                    />

                    {/* Method */}

                    <DetailRow
                        icon={CreditCard}
                        label="Payment Method"
                        value={
                            printableData.payment.paymentMethod ||
                            "-"
                        }
                    />

                    {/* Payment ID */}

                    <DetailRow
                        icon={Hash}
                        label="Payment ID"
                        value={
                            printableData.payment._id || "-"
                        }
                        small
                    />

                    {/* Note */}

                    <div className="border-t pt-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                            <FileText size={16} />

                            <span>Note</span>
                        </div>

                        <div
                            className="
                                min-h-14
                                rounded-lg
                                bg-gray-50
                                px-3 py-2.5
                                text-sm
                                text-gray-700
                            "
                        >
                            {printableData.payment.note?.trim()
                                ? printableData.payment.note
                                : "No note added"}
                        </div>
                    </div>
                </div>

                {/* ---------------- Footer ---------------- */}

                <div
                    className="
                        flex items-center justify-end
                        gap-3
                        border-t
                        bg-gray-50
                        px-5 py-4
                    "
                >
                    <button
                        type="button"
                        onClick={()=>setPrintableData(null)}
                        className="
                            rounded-lg
                            border border-gray-300
                            px-4 py-2
                            text-sm font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-100
                            cursor-pointer
                        "
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                           handlePrint()
                        }
                        className="
                            flex items-center gap-2
                            rounded-lg
                            bg-blue-600
                            px-4 py-2
                            text-sm font-medium
                            text-white
                            transition
                            hover:bg-blue-700
                            cursor-pointer
                        "
                    >
                        <Printer size={16} />

                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};


// =====================================================
// Detail Row
// =====================================================

const DetailRow = ({
    icon: Icon,
    label,
    value,
    small = false,
}) => {
    return (
        <div className="flex items-start gap-3">
            <div
                className="
                    mt-0.5
                    rounded-lg
                    bg-blue-50
                    p-2
                    text-blue-600
                "
            >
                <Icon size={16} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">
                    {label}
                </p>

                <p
                    className={`
                        mt-0.5
                        break-all
                        font-medium
                        text-gray-800

                        ${
                            small
                                ? "text-xs"
                                : "text-sm"
                        }
                    `}
                >
                    {value}
                </p>
            </div>
        </div>
    );
};

export default PaymentReciept;