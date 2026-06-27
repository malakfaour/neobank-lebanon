"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", passcode: "", confirm_passcode: "" });
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
    else if (form.passcode.length < 4) e.passcode = "Min 4 digits.";
    if (form.passcode !== form.confirm_passcode) e.confirm_passcode = "Passcodes do not match.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        full_name: form.full_name.trim(), email: form.email.trim(),
        phone: form.phone.trim(), passcode: form.passcode,
      });
      setToken(res.data.access_token);
      setUser(res.data.user);
      router.push("/kyc");
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.detail || "Registration failed." });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder }: {
    label: string; field: keyof typeof form; type?: string; placeholder: string;
  }) => (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        className={`w-full border rounded-2xl px-4 py-3 text-sm text-black outline-none placeholder-gray-400 transition-colors
          ${errors[field] ? "border-red-400" : "border-gray-200 focus:border-[#00C853]"}`}
      />
      {errors[field] && <p className="mt-1 text-red-500 text-xs">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-black">neo<span className="text-[#00C853]">.</span></h1>
        <p className="text-gray-500 text-sm mt-1">by NeoBank Lebanon</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-black mb-1">Create account</h2>
        <p className="text-gray-500 text-sm mb-6">Join NeoBank Lebanon</p>

        {errors.general && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <Field label="Full name" field="full_name" placeholder="Ali Hassan" />
        <Field label="Email" field="email" type="email" placeholder="ali@example.com" />
        <Field label="Mobile number" field="phone" type="tel" placeholder="+961 70 123 456" />
        <Field label="Passcode" field="passcode" type="password" placeholder="••••••" />
        <Field label="Confirm passcode" field="confirm_passcode" type="password" placeholder="••••••" />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#00C853] hover:bg-[#00B347] disabled:opacity-50 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors mt-2"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>

      <p className="text-gray-500 text-sm mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-[#00C853] font-semibold">Sign in</Link>
      </p>
    </div>
  );
}