"use client";
import React from "react";
import { useForm } from "react-hook-form";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import { createAdmin } from "@/utils/superAdmin/createSuperAdmin";

const CreateAdmin = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const onSubmit = async (data) => {
    //  console.log("data= ",data);
    setLoading(true);

    const res = await createAdmin(data);

    if (res.success) {
      reset();
      setLoading(false);
      setSuccess(res?.data);

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } else {
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* User login form */}

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md m-4  ">
        {/* <img src="/admin-icon.png" width={80} alt="Logo" className="my-0 mx-auto" /> */}
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Create Admin
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="adminId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Enter your admin ID"
              {...register("username", {
                required: "adminId is required",
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message:
                    "Admin ID can only contain letters, numbers and underscore",
                },
              })}
            />
            {/* error message */}
            {errors.username && (
              <p className="text-red-500 text-sm ml-2">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 chars, one letter & one number
                  message:
                    "Password must be at least 8 characters, atleast one uppercase letter, one lowercase letter, one number and one special character",
                },
              })}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",

                top: "45px",
                right: "5px",

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
            {errors.password && (
              <p className="text-red-500 text-sm ml-2">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => {
                  const password = document.getElementById("password").value;
                  return value === password || "Passwords do not match";
                },
              })}
            />

            <button
              type="button"
              onClick={() => setshowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "5px",
                top: "45px",
                color: "#333333",
                border: "none",
                cursor: "pointer",
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              tabIndex={-1}
            >
              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
            {/* error message */}
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm ml-2">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* successfully message */}

          <div className="flex justify-center items-center">
            {success && (
              <>
                <span className="text-green-500">{success}</span>
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs ml-2">
                  ✓
                </span>
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-center"
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="loader"></div>
              </div>
            ) : (
              "Create Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
