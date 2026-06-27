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

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...digits];
    updated[i] = val.slice(-1);
    setDigits(updated);
    setError("");
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = Array(6).fill("");
    pasted.split("").forEach((c, i) => { updated[i] = c; });
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
      setError(err?.response?.data?.detail || "Invalid or expired code.");
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
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
      setTimeout(() => setResent(false), 4000);
    } catch { setError("Could not resend. Try again."); }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-5">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-black">neo<span className="text-[#00C853]">.</span></h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-black mb-1">Verify your number</h2>
        <p className="text-gray-500 text-sm mb-6">Enter the 6-digit code sent to your phone.</p>

        <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold text-black bg-white rounded-2xl border-2 outline-none transition-colors
                ${error ? "border-red-400" : d ? "border-[#00C853]" : "border-gray-200 focus:border-[#00C853]"}`}
            />
          ))}
        </div>

        {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}
        {resent && <p className="mb-4 text-[#00C853] text-sm text-center">Code resent successfully.</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || digits.join("").length < 6}
          className="w-full bg-[#00C853] hover:bg-[#00B347] disabled:opacity-40 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Didn't get a code?{" "}
          <button onClick={handleResend} className="text-[#00C853] font-semibold">Resend</button>
        </p>
      </div>

      <p className="text-gray-500 text-sm mt-5">
        <Link href="/login" className="text-[#00C853] font-semibold">← Back to sign in</Link>
      </p>
    </div>
  );
}