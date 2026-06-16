"use client";
import React, { useState } from "react";
import {  Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Cards = ({ title, description, icon ,route }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = (route) => {
    setLoading(true);
    router.push(route);
  };

  return (
 <div onClick={()=>handleClick(route)} className="bg-white p-5 rounded-xl shadow-lg m-4 flex  flex-col items-center gap-2 cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-300 relative w-full ">

    {loading && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-gray-500" >Loading...</span>
          </div>
        </div>
      )}

      <div className="p-3 rounded-full bg-blue-100 text-blue-500 ">{icon}</div>
      <div>
        <h2 className="text-2xl  font-bold mb-6 text-center text-gray-700">
          {title}
        </h2>
        <p className="text-gray-600 text-center">{description}</p>
      </div>
    </div>
  );
};

export default Cards;
