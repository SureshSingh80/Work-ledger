"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

const CreateNewWorker = () => {
  const router = useRouter();
  return (
    <div className="">
      <button
        onClick={() => router.push("/admin/create-workers")}
        className="float-right inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer mb-4 mr-12 "
      >
        <PlusIcon className="h-4 w-4" />
        <span className='text-sm'>Create New Worker</span>
      </button>
    </div>
  );
};

export default CreateNewWorker;
