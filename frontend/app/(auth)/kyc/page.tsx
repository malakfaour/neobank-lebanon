"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

type Step = "selfie" | "id_upload" | "status";
type KYCStatus = "pending" | "approved" | "rejected" | "flagged";

export default function KYCPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("selfie");
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<KYCStatus>("pending");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch { setError("Camera access denied. Please allow camera permissions."); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (step === "selfie") startCamera();
    return () => stopCamera();
  }, [step]);

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setSelfieBlob(blob);
      setSelfiePreview(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg");
  };

  const handleUpload = async () => {
    if (!selfieBlob || !idFile) { setError("Both selfie and ID photo are required."); return; }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("selfie", selfieBlob, "selfie.jpg");
      form.append("id_photo", idFile);
      await api.post("/kyc/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setStep("status");
      pollRef.current = setInterval(async () => {
        try {
          const res = await api.get("/kyc/status");
          const s: KYCStatus = res.data.kyc_status;
          setStatus(s);
          if (s === "approved") { clearInterval(pollRef.current!); setTimeout(() => router.push("/dashboard"), 2000); }
          else if (s === "rejected") clearInterval(pollRef.current!);
        } catch {}
      }, 5000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Upload failed. Please try again.");
    } finally { setUploading(false); }
  };

  useEffect(() => () => { clearInterval(pollRef.current!); }, []);

  if (step === "selfie") return (
    <Layout step={1} title="Take a selfie" subtitle="Make sure your face is clearly visible and well lit.">
      {error && <ErrorBanner msg={error} />}
      {!selfiePreview ? (
        <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-[3/4] w-full">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {cameraActive && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 rounded-full border-2 border-[#00C853] border-dashed opacity-70" />
              </div>
              <button onClick={captureSelfie}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#00C853] border-4 border-white shadow-lg" />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-3xl overflow-hidden aspect-[3/4] w-full">
            <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSelfieBlob(null); setSelfiePreview(null); startCamera(); }}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 text-sm font-semibold">Retake</button>
            <button onClick={() => setStep("id_upload")}
              className="flex-1 py-3 rounded-2xl bg-[#00C853] text-white text-sm font-bold">Use this photo</button>
          </div>
        </div>
      )}
    </Layout>
  );

  if (step === "id_upload") return (
    <Layout step={2} title="Upload your ID" subtitle="Take a clear photo of your national ID or passport.">
      {error && <ErrorBanner msg={error} />}
      <label className={`block w-full rounded-3xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors
        ${idPreview ? "border-[#00C853]" : "border-gray-200 hover:border-gray-300"}`}>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setIdFile(f); setIdPreview(URL.createObjectURL(f)); setError("");
        }} />
        {idPreview
          ? <img src={idPreview} alt="ID" className="w-full object-cover max-h-56" />
          : <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">🪪</div>
              <p className="text-gray-500 text-sm">Tap to upload ID photo</p>
              <p className="text-gray-400 text-xs">JPG, PNG — max 10 MB</p>
            </div>
        }
      </label>
      {idPreview && <p className="text-[#00C853] text-sm text-center mt-2">✓ {idFile?.name}</p>}
      <div className="flex gap-3 mt-4">
        <button onClick={() => { setStep("selfie"); setIdFile(null); setIdPreview(null); }}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 text-sm font-semibold">Back</button>
        <button onClick={handleUpload} disabled={!idFile || uploading}
          className="flex-1 py-3 rounded-2xl bg-[#00C853] disabled:opacity-40 text-white text-sm font-bold">
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout step={3} title="Verification status" subtitle="We're reviewing your documents.">
      <div className="flex flex-col items-center gap-4 py-4">
        {status === "pending" && <>
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center text-3xl animate-pulse">⏳</div>
          <div className="text-center">
            <p className="font-bold text-black">Under review</p>
            <p className="text-gray-500 text-sm mt-1">This usually takes under a minute.</p>
          </div>
          <div className="flex gap-1">
            {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-[#00C853] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </>}
        {status === "approved" && <>
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">✅</div>
          <div className="text-center">
            <p className="font-bold text-black">Identity verified</p>
            <p className="text-gray-500 text-sm mt-1">Redirecting to your dashboard...</p>
          </div>
        </>}
        {(status === "rejected" || status === "flagged") && <>
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">❌</div>
          <div className="text-center">
            <p className="font-bold text-black">Verification failed</p>
            <p className="text-gray-500 text-sm mt-1">{status === "flagged" ? "Under manual review. We'll notify you." : "Please try again."}</p>
          </div>
          {status === "rejected" && (
            <button onClick={() => { setStep("selfie"); setSelfieBlob(null); setSelfiePreview(null); setIdFile(null); setIdPreview(null); setStatus("pending"); }}
              className="w-full py-3 rounded-2xl bg-[#00C853] text-white text-sm font-bold">Try again</button>
          )}
        </>}
      </div>
    </Layout>
  );
}

function Layout({ step, title, subtitle, children }: { step: number; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-black">neo<span className="text-[#00C853]">.</span></h1>
        <div className="flex justify-center gap-2 mt-4">
          {[1,2,3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300
              ${s === step ? "w-8 bg-[#00C853]" : s < step ? "w-4 bg-[#00C853]/40" : "w-4 bg-gray-200"}`} />
          ))}
        </div>
      </div>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-black mb-1">{title}</h2>
        <p className="text-gray-500 text-sm mb-5">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{msg}</div>;
}