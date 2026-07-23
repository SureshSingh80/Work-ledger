"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { createPayment } from "@/utils/admin/createPayment";
import ShowResponseData from "./ShowResponseData";

const PaymentModal = ({
  isOpen,
  worker,
 setIsOpen,
 refetch
 
}) => {
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState('');
  const [isSubmitting,setIsSubmitting] = useState(false);

  const {register,handleSubmit,formState: { errors }, reset,} = useForm({
  defaultValues: {
    amount: "",
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
    note: "",
  },
});



  if (!isOpen || !worker) return null;

  const workedDays =
    worker.totalPresent + worker.totalHalfDay * 0.5;

  const totalEarned =
    workedDays * worker.dailyWage;

  

  const pending = totalEarned - (worker.totalPaid || 0);

   const onSubmit = async (data) =>{
       setIsSubmitting(true);
       const res = await createPayment(data.amount,data.paymentMethod,data.paymentDate,data.note,worker._id);
       if(res.success){
        setError('');
        setSuccess(res.data);
        refetch();
        reset();
       }else{
         setSuccess('');
         setError(res.error);
       }

       setIsSubmitting(false);
      
   }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={()=>setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">
            Record Payment
          </h2>

          <button
            onClick={()=>setIsOpen(false)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6 overflow-y-auto">
          {/* Worker Details */}

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">

            <div>
              <p className="text-sm text-gray-500">
                Worker
              </p>

              <p className="font-semibold">
                {worker.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Worker Type
              </p>

              <p className="font-semibold">
                {worker.workerType}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Daily Wage
              </p>

              <p className="font-semibold">
                ₹{worker.dailyWage}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Worked Days
              </p>

              <p className="font-semibold">
                {workedDays}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Earned
              </p>

              <p className="font-semibold text-green-700">
                ₹{totalEarned}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Paid
              </p>

              <p className="font-semibold text-blue-700">
                ₹{worker.totalPaid || 0}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-500">
                Pending Amount
              </p>

              <p className="text-xl font-bold text-red-600">
                ₹{pending}
              </p>
            </div>
          </div>

          {/* Amount */}

          <div>
            <label className="mb-1 block font-medium">
              Payment Amount
            </label>

             <input
                type="number"
                placeholder="Enter amount"
                className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                {...register("amount", {
                required: "Payment amount is required",
                min: {
                    value: 1,
                    message: "Amount must be greater than 0",
                },
                // validate: (value) =>
                //     Number(value) <= pending ||
                //     "Amount cannot exceed pending amount",
                })}
            />

            {errors.amount && (
                <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
                </p>
            )}
          </div>

          {/* Method */}

          <div>
            <label className="mb-1 block font-medium">
                Payment Method
            </label>

            <select
                className="w-full rounded-lg border p-3 outline-none"
                {...register("paymentMethod", {
                required: "Select payment method",
                })}
            >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">
                Bank Transfer
                </option>
            </select>

            {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">
                {errors.paymentMethod.message}
                </p>
            )}
        </div>

          {/* Date */}

          <div>
                <label className="mb-1 block font-medium">
                    Payment Date
                </label>

                <input
                    type="date"
                    className="w-full rounded-lg border p-3 outline-none"
                    {...register("paymentDate", {
                    required: "Payment date is required",
                    })}
                />

                {errors.paymentDate && (
                    <p className="mt-1 text-sm text-red-600">
                    {errors.paymentDate.message}
                    </p>
                )}
            </div>

          {/* Note */}

          <div>
            <label className="mb-1 block font-medium">
                Remark
            </label>

                <textarea
                    rows={3}
                    placeholder="Optional..."
                    className="w-full rounded-lg border p-3 outline-none"
                    {...register("note", {
                    maxLength: {
                        value: 300,
                        message: "Maximum 300 characters allowed",
                    },
                    })}
                />

                {errors.note && (

                    <p className="mt-1 text-sm text-red-600">
                     {errors.note.message}
                    </p>
                )}
            </div>

          {/* Footer */}

          {/* response message */}
          <div>
            {
              <ShowResponseData success={success} error={error} />
            }
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
                type="button"
                onClick={() => {
                reset();
                setIsOpen(false);
                }}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100"
            >
                Cancel
            </button>

            <button
                disabled={isSubmitting}
                type="submit"
                className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
                {isSubmitting ? "Saving..." : "Save Payment"}
            </button>
         </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;