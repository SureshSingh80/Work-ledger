"use client";

import { useState, useRef, useEffect } from "react";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    setLoading(true);

    try {
      console.log(enteredOtp);

      // verify otp api
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Enter the 6-digit code sent to
          <br />
          su****@gmail.com
        </p>

        <form onSubmit={handleSubmit}>
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

          <button
            disabled={otp.join("").length !== 6 || loading}
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
              className="
                text-blue-600
                font-medium
                hover:underline
              "
            >
              
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}