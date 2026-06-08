"use client";

import { forgotPassword } from "@/utils/admin/forgotPassword";
import { verifyOTP } from "@/utils/admin/verifyOTP";
import { useState, useRef, useEffect } from "react";
import DotCircleLoader from "../DotCircleLoader";
import { resetNewPassword } from "@/utils/admin/resetNewPassword";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShowResponseData from "@/components/ShowResponseData";

export default function VerifyOTPPage({ email }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);

  const inputRefs = useRef([]);
  const router = useRouter();

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm();

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .trim()
      .slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split("");

    const updated = [...otp];

    digits.forEach((digit, index) => {
      updated[index] = digit;
    });

    setOtp(updated);

    inputRefs.current[5]?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    setLoading(true);
    const res = await verifyOTP(email, enteredOtp);
    if (res.success) {
      setError("");
      setSuccess(res.data.message || "OTP verified successfully");
    } else {
      setError(res.error.message || "Verification failed");
      setSuccess("");
    }
    setLoading(false);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleResendOTP = async ()=>{
        setSuccess('');
        setError('');
       const res = await forgotPassword(email);
       if(res.success){
        setTimer(60);
       }
  }

  const onSubmit = async (data)=>{
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await resetNewPassword(email, data.password, data.confirmPassword); 
      if(res.success){
        setSuccess(res.data);
        setError('');
        
      }else{
        setError(res.error.message || "Failed to set new password");
        setSuccess('');
      }
      setLoading(false);
      reset();
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      {
        success || loading ? (
          //  re-enter new password component
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
            <p className="text-gray-600 mb-4">
              You can now set a new password for your account.
            </p>
           <div>

        {/* Password */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="relative mt-4">
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

           <ShowResponseData success={success} error={error} />  

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-center mt-4"
          >
            {loading ? <DotCircleLoader /> : "Set New Password"}
          </button>
        </form>
           </div>
          </div>
        ):(
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Enter the 6-digit code sent to
          <br />
          {email.replace(  /^(.{4}).*?(.{4}@)/,"$1********$2")}
        </p>

        <form onSubmit={handleVerifyOTP}>
        <div
            className="flex justify-center gap-3 mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) =>
                  (inputRefs.current[index] = el)
                }
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                className="
                  w-12 h-14
                  text-center
                  text-xl
                  font-bold
                  border-2
                  rounded-lg
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            ))}
        </div>

         <ShowResponseData success={success} error={error} />  

          <button
            disabled={otp.join("").length !== 6 || loading}
            onClick={handleVerifyOTP}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              text-white
              py-3
              rounded-lg
              font-semibold
              transition
            "
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-6">
          {timer > 0 ? (
            <p className="text-gray-500">
              Resend OTP in {timer}s
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="
                bg-green-600
                hover:bg-green-700
                text-white
                py-2
                px-4
                rounded-lg
                cursor-pointer
              "
            >
              
              Resend OTP
            </button>
          )}
        </div>
      </div>
        )
      }
    </div>
  );
}