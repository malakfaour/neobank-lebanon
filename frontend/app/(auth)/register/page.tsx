"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    passcode: "",
    confirm_passcode: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form> & { general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\+?[0-9]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (!form.passcode) e.passcode = "Passcode is required.";
    else if (form.passcode.length < 4) e.passcode = "Passcode must be at least 4 digits.";
    if (!form.confirm_passcode) e.confirm_passcode = "Please confirm your passcode.";
    else if (form.passcode !== form.confirm_passcode) e.confirm_passcode = "Passcodes do not match.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        passcode: form.passcode,
      });
      const { access_token, user } = res.data;
      setToken(access_token);
      setUser(user);
      router.push("/kyc");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Registration failed. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, field, type = "text", placeholder,
  }: {
    label: string;
    field: keyof typeof form;
    type?: string;
    placeholder: string;
  }) => (
    <div className="mb-4">
      <label className="block text-gray-300 text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        className={`w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none border transition-colors
          ${errors[field] ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-emerald-500"}`}
      />
      {errors[field] && (
        <p className="mt-1.5 text-red-400 text-xs">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white tracking-tight">
            Neo<span className="text-emerald-400">Bank</span>
          </span>
          <p className="text-gray-400 text-sm mt-1">Lebanon</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h1 className="text-white text-xl font-semibold mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-6">Join NeoBank Lebanon</p>

          {errors.general && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <Field label="Full name" field="full_name" placeholder="Ali Hassan" />
          <Field label="Email" field="email" type="email" placeholder="ali@example.com" />
          <Field label="Mobile number" field="phone" type="tel" placeholder="+961 70 123 456" />
          <Field label="Passcode" field="passcode" type="password" placeholder="••••••" />

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-1.5">
              Confirm passcode
            </label>
            <input
              type="password"
              placeholder="••••••"
              value={form.confirm_passcode}
              onChange={(e) => setForm({ ...form, confirm_passcode: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none border transition-colors
                ${errors.confirm_passcode ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-emerald-500"}`}
            />
            {errors.confirm_passcode && (
              <p className="mt-1.5 text-red-400 text-xs">{errors.confirm_passcode}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
