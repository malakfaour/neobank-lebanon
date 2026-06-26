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
      const res = await api.post("/auth/login", {
        phone: form.phone.trim(),
        passcode: form.passcode,
      });
      const { access_token, user } = res.data;
      setToken(access_token);
      setUser(user);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Invalid phone or passcode.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
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
          <h1 className="text-white text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

          {/* General error */}
          {errors.general && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1.5">
              Mobile number
            </label>
            <input
              type="tel"
              placeholder="+961 70 123 456"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none border transition-colors
                ${errors.phone ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-emerald-500"}`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-red-400 text-xs">{errors.phone}</p>
            )}
          </div>

          {/* Passcode */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-1.5">
              Passcode
            </label>
            <input
              type="password"
              placeholder="••••••"
              value={form.passcode}
              onChange={(e) => setForm({ ...form, passcode: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none border transition-colors
                ${errors.passcode ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-emerald-500"}`}
            />
            {errors.passcode && (
              <p className="mt-1.5 text-red-400 text-xs">{errors.passcode}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          No account yet?{" "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
