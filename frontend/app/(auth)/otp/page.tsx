"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

export default function OTPPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value.slice(-1);
    setDigits(updated);
    setError("");
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = Array(6).fill("");
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setDigits(updated);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-otp", { otp: code });
      router.push("/kyc");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Invalid or expired code.";
      setError(msg);
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp");
      setResent(true);
      setError("");
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
      setTimeout(() => setResent(false), 4000);
    } catch {
      setError("Could not resend code. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white tracking-tight">
            Neo<span className="text-emerald-400">Bank</span>
          </span>
          <p className="text-gray-400 text-sm mt-1">Lebanon</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h1 className="text-white text-xl font-semibold mb-1">Verify your number</h1>
          <p className="text-gray-400 text-sm mb-6">
            Enter the 6-digit code sent to your phone.
          </p>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-semibold text-white bg-gray-800 rounded-xl border outline-none transition-colors
                  ${error ? "border-red-500" : digit ? "border-emerald-500" : "border-gray-700 focus:border-emerald-500"}`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="mb-4 text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Resent confirmation */}
          {resent && (
            <p className="mb-4 text-emerald-400 text-sm text-center">Code resent successfully.</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || digits.join("").length < 6}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          {/* Resend */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Didn't get a code?{" "}
            <button
              onClick={handleResend}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Resend
            </button>
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}