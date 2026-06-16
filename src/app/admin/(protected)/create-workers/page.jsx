'use client';

import { workerSchema } from '@/lib/validations/worker.schema';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorker } from '@/utils/admin/createWorker';
import ShowResponseData from '@/components/ShowResponseData';

const Page = () => {

  const [success,setSuccess] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  const { register, handleSubmit,reset, formState: { errors } } = useForm({
  resolver: zodResolver(workerSchema),
});

    const onSubmit = async(data)=>{

        setLoading(true);
        setError('');
        setSuccess('');
        const res = await createWorker(data);
        if(res.success){
          setSuccess(res.data);
          setTimeout(()=>{
            setSuccess('');
          },2000);
          setError('');
          reset();
        }else{
          setError(res.error);
          setSuccess("");
        }
        setLoading(false);
    }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Add New Worker
        </h1>

        <p className="text-gray-500 mb-8">
          Fill in the details below to register a new worker.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker Name
            </label>

            <input
              type="text"
              placeholder="Enter worker name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>

            <input
              type="tel"
              placeholder="Enter mobile number"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("mobile")}
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm">{errors.mobile.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>

            <textarea
              rows={3}
              placeholder="Enter address"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          {/* Worker Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker Type
            </label>

            <select className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" {...register("workerType")}>

              <option value="">Select Worker Type</option>
              <option value="Rajmistri">Rajmistri</option>
              <option value="Helper">Helper</option>
              <option value="Painter">Painter</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Other">Other</option>

            </select>
            {errors.workerType && (
              <p className="text-red-500 text-sm">{errors.workerType.message}</p>
            )}
          </div>

          {/* Daily Wage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Wage (₹)
            </label>

            <input
              type="number"
              placeholder="Enter daily wage"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("dailyWage")}
            />
            {errors.dailyWage && (
              <p className="text-red-500 text-sm">{errors.dailyWage.message}</p>
            )}
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Joining Date
            </label>

            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("joiningDate")}
            />
            {errors.joiningDate && (
              <p className="text-red-500 text-sm">{errors.joiningDate.message}</p>
            )}
          </div>

          <div>
             <ShowResponseData success={success} error={error} />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">

            <button
              type="submit"
              className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {loading ? "Creating..." : "Create Worker"}
            </button>

            <button
                type="reset"
              className="cursor-pointer bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Reset
            </button>

          </div>

          
        </form>

      </div>
    </div>
  );
};

export default Page;