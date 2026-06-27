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
    } finally { setLoading(false); }
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%", border: `1.5px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
    borderRadius: "14px", padding: "12px 16px", fontSize: "14px",
    color: "#000", outline: "none", boxSizing: "border-box" as const,
    backgroundColor: "#fff",
  });

  const Field = ({ label, field, type = "text", placeholder }: {
    label: string; field: keyof typeof form; type?: string; placeholder: string;
  }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        style={inputStyle(!!errors[field])}
      />
      {errors[field] && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px" }}>{errors[field]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", fontWeight: "800", color: "#000", letterSpacing: "-1px" }}>
          neo<span style={{ color: "#00C853" }}>.</span>
        </div>
        <div style={{ color: "#999", fontSize: "13px", marginTop: "4px" }}>by NeoBank Lebanon</div>
      </div>

      <div style={{ width: "100%", maxWidth: "380px", backgroundColor: "#fff", borderRadius: "24px", padding: "28px", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#000", marginBottom: "4px" }}>Create account</h2>
        <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>Join NeoBank Lebanon</p>

        {errors.general && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "12px 16px", color: "#DC2626", fontSize: "13px", marginBottom: "16px" }}>
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
          style={{ width: "100%", backgroundColor: loading ? "#86EFAC" : "#00C853", color: "#fff", fontWeight: "700", fontSize: "15px", border: "none", borderRadius: "14px", padding: "14px", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>

      <p style={{ color: "#999", fontSize: "13px", marginTop: "20px" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#00C853", fontWeight: "600", textDecoration: "none" }}>Sign in</Link>
      </p>
    </div>
  );
}