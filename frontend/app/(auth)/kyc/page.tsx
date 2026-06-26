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

  // Start camera
  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
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

  // Capture selfie
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

  const retakeSelfie = () => {
    setSelfieBlob(null);
    setSelfiePreview(null);
    startCamera();
  };

  // ID file pick
  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIdPreview(URL.createObjectURL(file));
    setError("");
  };

  // Upload both
  const handleUpload = async () => {
    if (!selfieBlob || !idFile) {
      setError("Both selfie and ID photo are required.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("selfie", selfieBlob, "selfie.jpg");
      form.append("id_photo", idFile);
      await api.post("/kyc/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStep("status");
      startPolling();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Poll status every 5s
  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get("/kyc/status");
        const s: KYCStatus = res.data.kyc_status;
        setStatus(s);
        if (s === "approved") {
          clearInterval(pollRef.current!);
          setTimeout(() => router.push("/dashboard"), 2000);
        } else if (s === "rejected") {
          clearInterval(pollRef.current!);
        }
      } catch {}
    }, 5000);
  };

  useEffect(() => () => { clearInterval(pollRef.current!); }, []);

  // ── STEP 1: Selfie ──────────────────────────────────────────────
  if (step === "selfie") {
    return (
      <Layout step={1} title="Take a selfie" subtitle="Make sure your face is clearly visible and well lit.">
        {error && <ErrorBanner msg={error} />}
        {!selfiePreview ? (
          <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-[3/4] w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {cameraActive && (
              <>
                {/* Face guide oval */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 rounded-full border-2 border-emerald-400 border-dashed opacity-60" />
                </div>
                <button
                  onClick={captureSelfie}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 border-4 border-white transition-colors"
                />
              </>
            )}
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={startCamera} className="text-emerald-400 text-sm font-medium">
                  Start camera
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden aspect-[3/4] w-full">
              <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={retakeSelfie}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-500 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={() => setStep("id_upload")}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
              >
                Use this photo
              </button>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // ── STEP 2: ID Upload ───────────────────────────────────────────
  if (step === "id_upload") {
    return (
      <Layout step={2} title="Upload your ID" subtitle="Take a clear photo of your national ID or passport.">
        {error && <ErrorBanner msg={error} />}
        <label className={`block w-full rounded-2xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden
          ${idPreview ? "border-emerald-500" : "border-gray-700 hover:border-gray-500"}`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleIdFile} />
          {idPreview ? (
            <img src={idPreview} alt="ID preview" className="w-full object-cover max-h-56" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">🪪</div>
              <p className="text-gray-400 text-sm">Tap to upload ID photo</p>
              <p className="text-gray-600 text-xs">JPG, PNG — max 10 MB</p>
            </div>
          )}
        </label>

        {idPreview && (
          <p className="text-emerald-400 text-sm text-center mt-2">
            ✓ {idFile?.name}
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { setStep("selfie"); setIdFile(null); setIdPreview(null); }}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-500 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleUpload}
            disabled={!idFile || uploading}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-white text-sm font-semibold transition-colors"
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </Layout>
    );
  }

  // ── STEP 3: Status ──────────────────────────────────────────────
  return (
    <Layout step={3} title="Verification status" subtitle="We're reviewing your documents.">
      <div className="flex flex-col items-center gap-5 py-4">
        {status === "pending" && (
          <>
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-3xl animate-pulse">⏳</div>
            <div className="text-center">
              <p className="text-white font-semibold">Under review</p>
              <p className="text-gray-400 text-sm mt-1">This usually takes under a minute.</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </>
        )}
        {status === "approved" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">✅</div>
            <div className="text-center">
              <p className="text-white font-semibold">Identity verified</p>
              <p className="text-gray-400 text-sm mt-1">Redirecting to your dashboard...</p>
            </div>
          </>
        )}
        {(status === "rejected" || status === "flagged") && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl">❌</div>
            <div className="text-center">
              <p className="text-white font-semibold">Verification failed</p>
              <p className="text-gray-400 text-sm mt-1">
                {status === "flagged"
                  ? "Your documents are under manual review. We'll notify you shortly."
                  : "We could not verify your identity. Please try again."}
              </p>
            </div>
            {status === "rejected" && (
              <button
                onClick={() => { setStep("selfie"); setSelfieBlob(null); setSelfiePreview(null); setIdFile(null); setIdPreview(null); setStatus("pending"); }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
              >
                Try again
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

// ── Shared layout ────────────────────────────────────────────────
function Layout({ step, title, subtitle, children }: {
  step: number; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-white tracking-tight">
            Neo<span className="text-emerald-400">Bank</span>
          </span>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300
                ${s === step ? "w-8 bg-emerald-500" : s < step ? "w-4 bg-emerald-700" : "w-4 bg-gray-700"}`} />
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h1 className="text-white text-xl font-semibold mb-1">{title}</h1>
          <p className="text-gray-400 text-sm mb-5">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
      {msg}
    </div>
  );
}
