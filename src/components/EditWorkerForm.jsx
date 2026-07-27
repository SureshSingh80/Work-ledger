'use client'

import { EditWorkerById } from "@/utils/admin/EditWorkerById";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ShowResponseData from "./ShowResponseData";

const EditWorkerForm = ({ worker, setIsEditing,refetch }) => {

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: worker?.name || "",
      mobile: worker?.mobile || "",
      address: worker?.address || "",
      workerType: worker?.workerType || "Other",
      dailyWage: worker?.dailyWage || "",
      joiningDate: worker?.joiningDate
        ? new Date(worker.joiningDate).toISOString().split("T")[0]
        : "",
      isActive: worker?.isActive ?? true,
    }
  });

  const onSubmit = async (updatedData) => {
    setLoading(true);
    const res = await EditWorkerById(worker._id, updatedData);

    if (res.success) {
      setError('');
      setIsEditing(false);
      setSuccess(res.data);
       refetch();
    }else{
      setSuccess('');
      console.log("Error in updating worker", res.error);
      setError(res.error);
    }

   setLoading(false);
    
    
  };

  return (
    <div className="max-w-3xl mx-auto rounded-2xl bg-white p-6 shadow-md border">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Edit Worker
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >

        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Worker Name
          </label>

          <input
            type="text"
            {...register("name")}
            
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Mobile Number
          </label>

          <input
            type="text"
            {...register("mobile")}
           
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Address
          </label>

          <textarea
            rows={3}
            {...register("address")}
        
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Worker Type */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Worker Type
          </label>

          <select
            {...register("workerType")}
         
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Rajmistri">Rajmistri</option>
            <option value="Helper">Helper</option>
            <option value="Painter">Painter</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Daily Wage */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Daily Wage (₹)
          </label>

          <input
            type="number"
            {...register("dailyWage")}
          
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Joining Date */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Joining Date
          </label>

          <input
            type="date"
            {...register("joiningDate")}
       
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">

          <input
            type="checkbox"
            {...register("isActive")}
         
            className="h-4 w-4"
          />

          <label className="text-sm font-medium text-gray-700">
            Active Worker
          </label>

        </div>

        <div>
          {
             <ShowResponseData success={success} error={error}/>
          }
        </div>

        {/* Buttons */}
       
          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={()=>setIsEditing(false)}
              className="rounded-lg border px-5 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
             {loading ? "Saving..." : "Save"}
            </button>

          </div>
      

      </form>

    </div>
  );
};

export default EditWorkerForm;