'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const page = () => {
    const {register, handleSubmit, formState: { errors }} = useForm();
     
    const onSubmit = (data)=>{
        console.log(data);
    }

    const [showPassword, setShowPassword] = useState(false);
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* User login form */}

        <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md'>
          <h2 className="text-2xl font-bold mb-6 text-center text-black">Login to LabourManager</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter your username"
                {...register("username", { required:"username is required", pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message:
                    "Username can only contain letters, numbers and underscore",
                },})}
              />
              {/* error message */}
              {errors.username && <p className="text-red-500 text-sm ml-2">{errors.username.message}</p>}
            </div>

             {/* Password */}
            <div className='relative'>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter your password"
                {...register("password", { required: "Password is required",pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 chars, one letter & one number
                message:
                  "Password must be at least 8 characters, atleast one uppercase letter, one lowercase letter, one number and one special character",
              }, })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                 position: "absolute",
                  
                 top: "45px",
                 right:"5px",
               
                  color: "#333333",
                  border: "none",
                  cursor: "pointer",
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
                {/* error message */}
                {errors.password && <p className="text-red-500 text-sm ml-2">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
    </div>
  )
}

export default page