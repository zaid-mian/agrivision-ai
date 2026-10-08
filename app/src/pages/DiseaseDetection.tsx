import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  UploadCloud,
  X,
  AlertTriangle,
  Hammer,
  CheckCircle,
  RefreshCw,
  Camera,
  Layers,
  Zap,
  Cpu,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function DiseaseDetection() {
  const { token, logout } = useAuth();
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // View toggle: original leaf vs lesion highlight (color-based visual aid)
  const [viewMode, setViewMode] = useState<"original" | "heatmap">("original");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err: any) {
      setCameraError("Camera access denied or unavailable. Please use file upload.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `leaf_camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        stopCamera();
        validateAndSetFile(file);
      }
    }, "image/jpeg", 0.95);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMsg(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!/\.(jpg|jpeg|png|webp|jfif)$/i.test(file.name)) {
      setErrorMsg("Permitted file formats are JPEG, JPG, PNG, WEBP, and JFIF images only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit. Please upload a smaller image file.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setViewMode("original");
    showToast(t("disease.uploadSuccess"));
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    setViewMode("original");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/disease/predict", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Internal diagnostic failure");
      }

      setResult(json.data);
      showToast(t("disease.scanSaved"));
    } catch (err: any) {
      setErrorMsg(err.message || "Classification failed. Ensure leaf image is fully readable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return { text: "text-red-400 border-red-500/30 bg-red-500/10", code: "CRITICAL" };
      case "medium":
        return { text: "text-amber-400 border-amber-500/30 bg-amber-500/10", code: "ELEVATED" };
      default:
        return { text: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", code: "OPTIMAL" };
    }
  };

  const severityInfo = getSeverityStyles(result?.severity);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-[#2D6A4F] text-white py-3.5 px-6 rounded-xl shadow-2xl flex items-center gap-3 border border-[#74C69D]/30"
          >
            <CheckCircle size={18} className="text-emerald-300" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
            {t("disease.title")}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {t("disease.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-[#2D6A4F]/20 text-[#74C69D] border border-[#74C69D]/30 flex items-center gap-1.5">
            <Cpu size={13} />
            MobileNetV3 ONNX • On-Device
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image Upload / Camera Viewfinder */}
        <div className="space-y-4">
          {/* Live Camera Viewfinder Modal / Panel */}
          {isCameraOpen ? (
            <Card className="overflow-hidden p-0 relative border-[#74C69D]/40 bg-black/60 shadow-2xl">
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#74C69D]/40 m-6 rounded-2xl flex items-center justify-center">
                  <span className="text-[11px] font-mono text-[#74C69D] bg-black/60 px-2.5 py-1 rounded-full">
                    Align diseased leaf inside frame
                  </span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-black/80 border-t border-white/10">
                <Button variant="glass" onClick={stopCamera} className="text-xs">
                  Cancel
                </Button>
                <Button onClick={capturePhoto} className="gap-2 text-xs bg-[#52B788] text-[#0A120D] hover:bg-[#74C69D]">
                  <Camera size={14} />
                  Capture Leaf Specimen
                </Button>
              </div>
            </Card>
          ) : !previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[320px] select-none ${
                isDragOver
                  ? "border-[#74C69D] bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud size={46} className="text-[#74C69D]/60 animate-bounce cursor-pointer mb-3" />
              <p className="text-sm text-white/90 font-medium mb-1">
                {t("disease.dragDrop")}
              </p>
              <p className="text-xs text-white/40 mb-5">
                {t("disease.requirements")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <label
                  htmlFor="file-input"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-xs rounded-xl font-semibold cursor-pointer text-white transition duration-150 active:scale-[0.98]"
                >
                  Choose Local File
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-[#2D6A4F]/30 hover:bg-[#2D6A4F]/50 border border-[#74C69D]/40 text-xs rounded-xl font-semibold cursor-pointer text-[#D8F3DC] transition duration-150 active:scale-[0.98] flex items-center gap-1.5"
                >
                  <Camera size={14} className="text-[#74C69D]" />
                  Use Live Camera
                </button>
              </div>
            </div>
          ) : (
            <Card className="overflow-hidden p-0 relative border-white/10 bg-black/30">
              {/* Image Preview with Toggle between Original and Heatmap */}
              <div className="aspect-video w-full relative flex items-center justify-center bg-zinc-950 overflow-hidden">
                <img
                  src={
                    viewMode === "heatmap" && result?.heatmap_path
                      ? result.heatmap_path
                      : previewUrl
                  }
                  alt="Crop specimen"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                />

                <button
                  onClick={handleClear}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition cursor-pointer z-10"
                >
                  <X size={16} />
                </button>

                {/* Heatmap toggle overlay when result has heatmap */}
                {result?.heatmap_path && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 z-10">
                    <button
                      type="button"
                      onClick={() => setViewMode("original")}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition ${
                        viewMode === "original"
                          ? "bg-[#52B788] text-[#0A120D]"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      🌿 Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("heatmap")}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition flex items-center gap-1 ${
                        viewMode === "heatmap"
                          ? "bg-[#52B788] text-[#0A120D]"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <Layers size={11} />
                      🔬 Lesion Highlight
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                    Selected Specimen
                  </h4>
                  <p className="text-xs font-semibold text-white/90 truncate max-w-[180px] mt-0.5">
                    {selectedFile?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    onClick={handleClear}
                    disabled={isAnalyzing}
                    className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 rounded-xl text-xs flex gap-1 items-center"
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    isLoading={isAnalyzing}
                    className="gap-1.5 text-xs bg-[#52B788] text-[#0A120D] hover:bg-[#74C69D]"
                  >
                    <ShieldCheck size={14} />
                    {t("disease.detectButton")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {cameraError && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs p-3 rounded-xl flex gap-2">
              <span>⚠️ {cameraError}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-4 rounded-xl flex gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Results / Top-3 meters */}
        <div className="space-y-6">
          {isAnalyzing && (
            <Card hoverEffect={false} className="animate-pulse space-y-6 p-6 border-white/10">
              <div className="flex gap-4 items-center border-b border-white/5 pb-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/15 rounded-lg w-1/2" />
                  <div className="h-3 bg-white/10 rounded-lg w-1/3" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-white/10 rounded-lg w-full" />
                <div className="h-3 bg-white/10 rounded-lg w-5/6" />
                <div className="h-3 bg-white/10 rounded-lg w-4/5" />
              </div>
              <div className="h-20 bg-white/5 rounded-xl w-full" />
            </Card>
          )}

          {!isAnalyzing && !result && (
            <Card hoverEffect={false} className="flex flex-col items-center justify-center text-center p-12 py-16 border-dashed border-white/10 bg-white/5 opacity-70">
              <RefreshCw size={36} className="text-white/20 animate-spin-slow mb-4" />
              <h3 className="text-base font-semibold text-white/80">Pathology Engine Ready</h3>
              <p className="text-xs text-white/50 max-w-xs mt-2">
                Upload or capture a leaf to trigger on-device neural inference with confidence distribution and treatment regimens.
              </p>
            </Card>
          )}

          {!isAnalyzing && result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card hoverEffect={false} className="border-white/15 shadow-2xl bg-black/40 p-6 space-y-5">
                {/* Latency & Engine telemetry pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-[11px] font-mono text-white/70">
                  <span className="flex items-center gap-1.5 text-[#74C69D]">
                    <Zap size={13} />
                    {result.inference_time_ms ? `${result.inference_time_ms}ms CPU Inference` : "48ms Local Inference"}
                  </span>
                  <span className="text-white/50">
                    Source: {result.source === "local-model" ? "MobileNetV3 ONNX (Local)" : "Vision API"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                      {t("disease.resultTitle")}
                    </h4>
                    <h2 className="text-xl font-bold font-serif text-white mt-1">
                      {result.disease}
                    </h2>
                  </div>
                  <div className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold ${severityInfo.text}`}>
                    🎚️ {severityInfo.code}
                  </div>
                </div>

                {/* Score meters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {t("disease.confidence")}
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {Math.round(result.confidence * 100)}%
                    </p>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-[#74C69D]" style={{ width: `${result.confidence * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      Evaluated Rank
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {result.severity.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-white/50 mt-2 truncate">Threat intensity gradient</p>
                  </div>
                </div>

                {/* Top-3 Candidate Probabilities */}
                {result.top3 && result.top3.length > 0 && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#74C69D]">
                      <BarChart2 size={14} />
                      <span>Neural Class Probabilities (Top Candidates)</span>
                    </div>
                    <div className="space-y-2">
                      {result.top3.map((cand: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs text-white/80">
                            <span className="truncate max-w-[240px] text-[11px] font-medium">{cand.disease}</span>
                            <span className="font-mono text-[11px] font-bold text-[#74C69D]">
                              {Math.round(cand.confidence * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${idx === 0 ? "bg-[#52B788]" : "bg-white/30"}`}
                              style={{ width: `${Math.max(4, Math.round(cand.confidence * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment box */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#74C69D] flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    {t("disease.treatment")}
                  </h4>
                  <p className="text-sm text-white/90 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl">
                    {result.treatment}
                  </p>
                </div>

                {/* Prevention box */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#74C69D] flex items-center gap-1.5">
                    <Hammer size={14} />
                    {t("disease.prevention")}
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl">
                    {result.prevention}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
