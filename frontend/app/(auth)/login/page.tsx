"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ phone: "", passcode: "" });
  const [errors, setErrors] = useState<{ phone?: string; passcode?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\+?[0-9]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (!form.passcode) e.passcode = "Passcode is required.";
    else if (form.passcode.length < 4) e.passcode = "Passcode must be at least 4 digits.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone: form.phone.trim(), passcode: form.passcode });
      setToken(res.data.access_token);
      setUser(res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.detail || "Invalid phone or passcode." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-black">
          neo<span className="text-[#00C853]">.</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">by NeoBank Lebanon</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-black mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

        {errors.general && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        {/* Phone */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mobile number</label>
          <div className={`flex items-center bg-white border rounded-2xl px-4 py-3 gap-2 ${errors.phone ? "border-red-400" : "border-gray-200 focus-within:border-[#00C853]"}`}>
            <span className="text-sm text-gray-500">🇱🇧 +961</span>
            <div className="w-px h-4 bg-gray-200" />
            <input
              type="tel"
              placeholder="70 123 456"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="flex-1 text-sm text-black outline-none placeholder-gray-400"
            />
          </div>
          {errors.phone && <p className="mt-1 text-red-500 text-xs">{errors.phone}</p>}
        </div>

        {/* Passcode */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Passcode</label>
          <input
            type="password"
            placeholder="••••••"
            value={form.passcode}
            onChange={(e) => setForm({ ...form, passcode: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={`w-full border rounded-2xl px-4 py-3 text-sm text-black outline-none placeholder-gray-400 ${errors.passcode ? "border-red-400" : "border-gray-200 focus:border-[#00C853]"}`}
          />
          {errors.passcode && <p className="mt-1 text-red-500 text-xs">{errors.passcode}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#00C853] hover:bg-[#00B347] disabled:opacity-50 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <p className="text-gray-500 text-sm mt-5">
        No account?{" "}
        <Link href="/register" className="text-[#00C853] font-semibold">Create one</Link>
      </p>
    </div>
  );
}