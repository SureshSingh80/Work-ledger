import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { formatISTDateForInput } from "@/utils/admin/formatISTDateForInput";
import { EditPayment } from "@/utils/admin/EditPayment";
import ShowResponseData from "./ShowResponseData";

const EditPaymentForm = ({ editableData, setEditableData, refetch }) => {

    const [editError,setEditError] = useState();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            amount: "",
            paymentDate: "",
            paymentMethod: "",
            note: "",
        },
    });

    // Fill form whenever payment is selected
    useEffect(() => {
        if (!editableData) return;

        reset({
            amount: editableData.amount ?? "",
            paymentDate: editableData.paymentDate
                ? formatISTDateForInput(editableData.paymentDate)
                : "",
            paymentMethod:
                editableData.paymentMethod ?? "",
                note: editableData.note ?? "",
        });
    }, [editableData, reset]);

    const submitHandler = async (data) => {

   
     
        const res = await EditPayment({
            paymentId: editableData.paymentId,
            amount: data.amount,
            paymentDate: data.paymentDate,
            paymentMethod: data.paymentMethod,
            note: data.note            
        });

        if (res.success) {
            setEditableData('');
            reset();
            refetch();
        }else{
            setEditError(res.error);
        }

    };

    if (!editableData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Edit Payment
                    </h2>

                    <button
                        type="button"
                        onClick={()=>setEditableData('')}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="space-y-4 p-5"
                >

                    {/* Amount */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Amount
                        </label>

                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            {...register("amount", {
                                required: "Amount is required",
                                min: {
                                    value: 1,
                                    message:
                                        "Amount must be greater than 0",
                                },
                            })}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />

                        {errors.amount && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.amount.message}
                            </p>
                        )}
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Payment Date
                        </label>

                        <input
                            type="date"
                            {...register("paymentDate", {
                                required:
                                    "Payment date is required",
                            })}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />

                        {errors.paymentDate && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.paymentDate.message}
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Payment Method
                        </label>

                        <select
                            {...register("paymentMethod", {
                                required:
                                    "Payment method is required",
                            })}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Select payment method
                            </option>

                            <option value="Cash">
                                Cash
                            </option>

                            <option value="UPI">
                                UPI
                            </option>

                            <option value="Bank Transfer">
                                Bank Transfer
                            </option>

                            <option value="Cheque">
                                Cheque
                            </option>
                        </select>

                        {errors.paymentMethod && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.paymentMethod.message}
                            </p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Note
                        </label>

                        <textarea
                            rows={3}
                            {...register("note")}
                            placeholder="Optional note..."
                            className="w-full resize-none rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                         {editError && (
                            <ShowResponseData error={editError} />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={()=>setEditableData('')}
                            disabled={isSubmitting}
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer "
                        >
                            Cancel
                        </button>

                       
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Updating..."
                                : "Update Payment"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPaymentForm;