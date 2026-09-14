import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  CheckCircle2,
  Coins,
  FileImage,
  HelpCircle,
  ImageUp,
  Info,
  Layers,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { runAnalysis } from "@/lib/analysis.functions";
import { getFreshAccessToken } from "@/lib/auth-bearer";
import { profileQuery, verdictLimitQuery } from "@/lib/data";
import { usePaymentRealtime } from "@/hooks/usePaymentRealtime";
import { compressImage } from "@/lib/image-compress";
import { checkAnalysisRateLimit, formatRetryAfter } from "@/lib/rateLimit";
import { LogoSymbol, LogoWatermark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analyze")({
  head: () => ({
    meta: [
      { title: "New Match Scan — PREDICTA" },
      {
        name: "description",
        content:
          "Upload instant or virtual football screenshots. PREDICTA AI decodes seed matrix patterns and calculates high-probability match picks.",
      },
      { property: "og:title", content: "New Match Scan — PREDICTA" },
      {
        property: "og:description",
        content:
          "Upload your instant virtual football screenshot and receive decisive, high-confidence match verdicts in seconds.",
      },
    ],
  }),
  component: AnalyzePage,
});

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const MAX_BYTES = 8 * 1024 * 1024;

const STAGES = [
  {
    stage: 1,
    progress: 25,
    label: "READING SEED HANDSHAKE PACKET",
    subtext: "Extracting raw image metadata and OCR fixture parameters...",
    icon: ScanSearch,
  },
  {
    stage: 2,
    progress: 55,
    label: "MATCHING FIXTURE ALGORITHMS",
    subtext: "Comparing pseudo-random seed hashes with historical V-League matrices...",
    icon: Trophy,
  },
  {
    stage: 3,
    progress: 82,
    label: "WEIGHING MARKET PROBABILITIES",
    subtext: "Evaluating Over/Under 2.5, GG/NG, and 1X2 market distributions...",
    icon: Sparkles,
  },
  {
    stage: 4,
    progress: 98,
    label: "LOCKING DECISIVE VERDICT",
    subtext: "Generating confidence rating and compiling final pick recommendation...",
    icon: Target,
  },
];

const LOG_TEMPLATES = [
  "INITIALIZING PREDICTA VISION OCR ENGINE V4.2...",
  "IMAGE RESOLUTION CHECK: OPTIMAL ASPECT RATIO DETECTED",
  "DECODING SEED MATRIX: 0x9F41...7B0E",
  "PARSING FIXTURE PREVIEW: TEAMS & TIMESTAMP MATCHED",
  "RUNNING MONTE CARLO SEED SIMULATION (10,000 CYCLES)",
  "CALCULATING WEIGHTED PROBABILITY DISTRIBUTIONS...",
  "DECISIVE VERDICT LOCKED WITH 96.4% ACCURACY CONFIDENCE",
];

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AnalyzePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const analyze = useServerFn(runAnalysis);
  usePaymentRealtime(user.id);
  const { data: profile } = useQuery(profileQuery(user.id));
  const { data: verdictLimit } = useQuery(verdictLimitQuery(user.id));

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const rl = checkAnalysisRateLimit(user.id);
      if (!rl.allowed) {
        throw new Error(
          `Please wait ${formatRetryAfter(rl.retryAfterSeconds)} before submitting another analysis.`,
        );
      }

      if ((profile?.credits ?? 0) < 1) throw new Error("INSUFFICIENT_CREDITS");
      if (!file) throw new Error("Select a football screenshot first.");
      if (!file.type.startsWith("image/")) throw new Error("Only image files are supported.");
      if (file.size > MAX_BYTES) throw new Error("Images must be smaller than 8MB.");

      const processedFile = await compressImage(file);
      const ext =
        processedFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
      let path = `${user.id}/${generateUUID()}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("screenshots")
          .upload(path, processedFile, { contentType: processedFile.type });
        if (uploadError) {
          // Fallback if bucket is missing or uncreated in Supabase Storage
          path = await fileToDataUrl(processedFile);
        }
      } catch {
        path = await fileToDataUrl(processedFile);
      }

      const { data: created, error: insertError } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          image_path: path,
          title: file.name.slice(0, 80),
        })
        .select("id")
        .single();
      if (insertError) throw new Error(insertError.message);

      const toError = (e: unknown) =>
        e instanceof Error
          ? e
          : new Error(typeof e === "string" && e ? e : "Analysis failed. Please try again.");
      const run = async () => analyze({ data: { analysisId: created.id } });
      let result;
      try {
        result = await run();
      } catch (err) {
        const normalized = toError(err);
        if (!/unauthor|invalid token|401/i.test(normalized.message)) throw normalized;
        try {
          await getFreshAccessToken();
          result = await run();
        } catch (retryErr) {
          throw toError(retryErr);
        }
      }
      return { id: created.id, irrelevant: Boolean(result?.irrelevant) };
    },
    onSuccess: async ({ id, irrelevant }) => {
      await queryClient.invalidateQueries();
      if (irrelevant) {
        toast.error("Not a football screenshot — 1 credit was used.");
      } else {
        toast.success("Verdict unlocked!");
      }
      navigate({ to: "/analysis/$id", params: { id } });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.error(
        message.includes("INSUFFICIENT_CREDITS")
          ? "You're out of credits. Top up to keep predicting."
          : message,
      );
    },
  });

  // Cycle animation stage & simulate live telemetry log lines during scan
  useEffect(() => {
    if (!mutation.isPending) {
      setStage(0);
      setLogs([]);
      return;
    }

    setLogs([LOG_TEMPLATES[0]!]);
    let logIndex = 1;

    const timer = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
      if (logIndex < LOG_TEMPLATES.length) {
        const nextLog = LOG_TEMPLATES[logIndex]!;
        setLogs((prev) => [...prev.slice(-3), nextLog]);
        logIndex++;
      }
    }, 1300);

    return () => clearInterval(timer);
  }, [mutation.isPending]);

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Invalid file format. Please upload an image (PNG, JPG, WEBP).");
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.error("File size exceeds 8MB limit. Please choose a smaller image.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const busy = mutation.isPending;
  const credits = profile?.credits ?? 0;
  const noCredits = credits < 1;
  const locked = busy || noCredits;
  const currentStageObj = STAGES[stage]!;

  return (
    <div className="space-y-5 sm:space-y-8 selection:bg-red-600 selection:text-white pb-16 px-1 sm:px-0">
      {/* HCI Top Page Header */}
      <PageHeader
        badgeText="REAL-TIME SEED DECODER"
        title="NEW MATCH SCAN."
        description="Drop in an instant or virtual football screenshot. PREDICTA decodes pseudo-random seed algorithms to deliver decisive picks."
      />

      <form
        className="grid gap-5 sm:gap-8 lg:grid-cols-12 items-start"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        {/* LEFT COLUMN: Main Scanning & Interactive Drop Zone (8 Cols Desktop) */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6 min-w-0">
          {/* Main Container Card */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-sm">
            <LogoWatermark className="opacity-[0.03] text-slate-950" />
            <LogoSymbol
              className="pointer-events-none absolute -right-8 -bottom-8 h-44 sm:h-56 w-auto opacity-[0.03] text-slate-950 select-none"
              aria-hidden
            />

            {/* Stage Indicator / Header */}
            <div className="relative mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 sm:pb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-red-600 text-white font-mono text-[11px] sm:text-xs font-bold shadow-md shadow-red-600/30 shrink-0">
                  01
                </span>
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-slate-950">
                    Upload Screenshot Preview
                  </h2>
                  <p className="text-[11px] sm:text-xs font-mono text-slate-500">
                    Instant V-League, Premier Virtual, or match slips
                  </p>
                </div>
              </div>

              {preview && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer px-3 py-1.5 h-auto transition-opacity duration-300",
                      busy && "opacity-40 pointer-events-none cursor-not-allowed",
                    )}
                  >
                    <RefreshCw className="mr-1 size-3 text-slate-500" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={handleClear}
                    className={cn(
                      "rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer px-3 py-1.5 h-auto transition-opacity duration-300",
                      busy && "opacity-40 pointer-events-none cursor-not-allowed",
                    )}
                  >
                    <Trash2 className="mr-1 size-3" />
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Dropzone Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (noCredits || busy) return;
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) handleFileChange(droppedFile);
              }}
              className={cn(
                "relative transition-all duration-300 rounded-2xl",
                isDragOver && "scale-[0.99] border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10",
              )}
            >
              <Input
                ref={fileInputRef}
                id="screenshot"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={locked}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />

              {/* State 1: Dropzone Upload Prompt (No file selected) */}
              {!preview && !busy && (
                <label
                  htmlFor="screenshot"
                  className={cn(
                    "relative flex min-h-[360px] sm:min-h-[440px] cursor-pointer flex-col items-center justify-center gap-4 sm:gap-5 overflow-hidden rounded-2xl border-2 border-dashed transition-all p-5 sm:p-10 text-center group",
                    isDragOver
                      ? "border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10 scale-[0.99]"
                      : "border-slate-300 bg-slate-50/60 hover:border-red-600 hover:bg-slate-50/90 shadow-2xs",
                    noCredits && "pointer-events-none opacity-60 hover:border-slate-300",
                  )}
                >
                  <div className="relative inline-flex size-14 sm:size-20 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-sm group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <span className="absolute -inset-1 rounded-2xl bg-red-600/20 animate-ping opacity-75 group-hover:opacity-100" />
                    <ImageUp className="relative size-7 sm:size-9 transition-transform group-hover:scale-110" />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 max-w-md">
                    <p className="text-xs sm:text-base font-extrabold uppercase tracking-tight text-slate-950 group-hover:text-red-600 transition-colors">
                      {noCredits
                        ? "CREDIT VAULT EMPTY — TOP UP TO SCAN"
                        : "TAP OR DRAG VIRTUAL MATCH SCREENSHOT HERE"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-mono text-slate-500 leading-relaxed">
                      Supports instant & virtual football screenshots (V-League, Premier, Instant Football). PNG, JPG, WEBP up to 8MB.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 border border-slate-200 shadow-2xs">
                      <Zap className="size-3 text-red-600" /> 1-Click Scan
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 border border-slate-200 shadow-2xs">
                      <Sparkles className="size-3 text-red-600" /> AI OCR Decoded
                    </span>
                  </div>
                </label>
              )}

              {/* State 2 & 3: Image Selected / Active AI Scanning Chamber */}
              {preview && (
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl bg-slate-950 border-2 transition-colors duration-300 min-h-[360px] sm:min-h-[440px] flex flex-col justify-between p-3 sm:p-5 shadow-2xl",
                    busy
                      ? "border-red-600 shadow-red-950/60"
                      : "border-slate-800 hover:border-slate-700",
                  )}
                >
                  {/* HUD Top Bar */}
                  <div className="relative z-20 flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 font-mono text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2 max-w-[75%] overflow-hidden">
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          busy ? "bg-red-600 animate-pulse" : "bg-emerald-500",
                        )}
                      />
                      <span className="font-bold text-red-500 uppercase tracking-wider truncate">
                        {busy ? `SCANNING SEED MATRIX` : "TARGET LOCKED & READY"}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-400 shrink-0">
                      {busy ? `${currentStageObj.progress}%` : "OCR PREVIEW"}
                    </span>
                  </div>

                  {/* Picture Chamber with Laser Sweeper & In-Canvas Telemetry Overlay */}
                  <div className="relative flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-2 min-h-[220px] sm:min-h-[320px]">
                    {/* Radar Grid Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e41827_1px,transparent_1px)] [background-size:18px_18px] sm:[background-size:24px_24px] opacity-20 pointer-events-none z-10" />

                    {/* Screenshot Image — Keeps 100% exact size and scale during scanning */}
                    <img
                      src={preview}
                      alt="Uploaded match screenshot"
                      className={cn(
                        "w-auto max-w-full max-h-[240px] sm:max-h-[320px] object-contain rounded-lg transition-opacity duration-300",
                        busy ? "opacity-75" : "opacity-100",
                      )}
                    />

                    {/* Laser Scanner Beam directly over the image */}
                    {busy && (
                      <>
                        <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_25px_#e41827,0_0_50px_#e41827] animate-laser-sweep z-30 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-b from-red-600/15 via-transparent to-red-600/15 pointer-events-none z-20" />
                      </>
                    )}

                    {/* HUD Target Corner Brackets */}
                    <div className="absolute top-2 left-2 size-3 sm:size-4 border-t-2 border-l-2 border-red-500 z-20" />
                    <div className="absolute top-2 right-2 size-3 sm:size-4 border-t-2 border-r-2 border-red-500 z-20" />
                    <div className="absolute bottom-2 left-2 size-3 sm:size-4 border-b-2 border-l-2 border-red-500 z-20" />
                    <div className="absolute bottom-2 right-2 size-3 sm:size-4 border-b-2 border-r-2 border-red-500 z-20" />

                    {/* Reticle Target when scanning */}
                    {busy && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25">
                        <div className="size-14 sm:size-20 rounded-full border-2 border-red-500/50 animate-pulse" />
                        <div className="absolute size-9 sm:size-12 rounded-full border-2 border-dashed border-red-500/80 animate-spin" />
                        <Target className="absolute size-5 sm:size-6 text-red-500" />
                      </div>
                    )}

                    {/* In-Canvas Scanning Telemetry & Progress HUD Overlay */}
                    {busy && (
                      <div className="absolute bottom-2 left-2 right-2 z-30 space-y-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-red-500/40 p-2 sm:p-2.5 font-mono shadow-xl animate-fade-in">
                        {/* Stage title + Progress percentage */}
                        <div className="flex items-center justify-between text-[10px] sm:text-xs font-extrabold">
                          <span className="text-red-400 truncate uppercase flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-red-500 animate-pulse inline-block shrink-0" />
                            STAGE {currentStageObj.stage}/4 · {currentStageObj.label}
                          </span>
                          <span className="text-white shrink-0">{currentStageObj.progress}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-500 shadow-sm shadow-red-600/50"
                            style={{ width: `${currentStageObj.progress}%` }}
                          />
                        </div>

                        {/* Subtext and live telemetry ticker line */}
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-300 gap-2">
                          <span className="truncate text-slate-400 max-w-[60%]">{currentStageObj.subtext}</span>
                          <span className="truncate text-red-400 font-bold shrink-0 max-w-[40%] text-right">
                            {logs.length > 0 ? logs[logs.length - 1] : "PROCESSING..."}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Constant Height File Info Bar */}
                  <div className="relative z-20 flex items-center justify-between pt-2 border-t border-slate-800/80 text-white font-mono text-xs">
                    <div className="flex items-center gap-2 overflow-hidden max-w-[70%]">
                      <FileImage className="size-3.5 sm:size-4 text-red-500 shrink-0" />
                      <span className="truncate text-[10px] sm:text-xs font-bold">{file?.name}</span>
                    </div>
                    <span className="shrink-0 text-[10px] sm:text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                      {file ? (file.size / (1024 * 1024)).toFixed(2) : "0"} MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom HCI Action Bar & Submit Trigger */}
            <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 sm:pt-6">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  <Coins className="size-3.5 sm:size-4 text-red-600 shrink-0" />
                  <span>Cost: 1 Credit / Scan · Max {verdictLimit ?? 2} Picks</span>
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-mono">
                  Vault Balance:{" "}
                  <span className={cn("font-bold", noCredits ? "text-red-600" : "text-slate-950")}>
                    {credits} Credits
                  </span>
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!file || locked}
                className="w-full sm:w-auto rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold uppercase tracking-wider text-xs px-6 sm:px-10 py-3 sm:py-4 shadow-xl shadow-red-600/30 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin" /> DECODING SEED MATRIX...
                  </span>
                ) : noCredits ? (
                  "CREDIT VAULT EMPTY"
                ) : !file ? (
                  "CHOOSE SCREENSHOT FIRST"
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    RUN MATCH SCAN <ArrowUpRight className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Vault Status, Supported Platforms & Usability Guidelines (4 Cols Desktop) */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* Card 1: Credit Vault Overview */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <Coins className="size-4 sm:size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950">
                    Vault Balance
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono">Scan Credit Account</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-extrabold text-slate-950">
                {credits} CR
              </span>
            </div>

            <div className="space-y-2.5 sm:space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Cost Per Scan:</span>
                <span className="font-bold text-slate-900">-1 Credit</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Remaining After Scan:</span>
                <span className="font-bold text-slate-900">
                  {Math.max(0, credits - (file ? 1 : 0))} Credits
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/credits" })}
              className="w-full rounded-full border-red-200 bg-red-50/60 text-red-600 hover:bg-red-600 hover:text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer"
            >
              Top Up Credits
            </Button>
          </div>

          {/* Card 2: Supported Leagues & Platforms */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
              <Layers className="size-4 text-red-600" /> Supported Virtual Leagues
            </h3>

            <div className="space-y-2 sm:space-y-2.5">
              {[
                { name: "V-League Instant Football", code: "V-LEAGUE", status: "Optimal" },
                { name: "English Virtual League", code: "EPL-V", status: "Optimal" },
                { name: "Spanish Virtual Liga", code: "LIGA-V", status: "High Accuracy" },
                { name: "Virtual Cup Kickoff Slips", code: "CUP-V", status: "High Accuracy" },
              ].map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3 sm:px-3.5 py-2 text-xs font-mono"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.code}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <CheckCircle2 className="size-3" /> {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: HCI Guidelines for Optimal AI Accuracy */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-900 text-white p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
              <Info className="size-4" /> Screenshot Best Practices
            </h3>

            <ul className="space-y-2.5 sm:space-y-3 text-[11px] sm:text-xs font-mono text-slate-300">
              <li className="flex items-start gap-2 sm:gap-2.5">
                <span className="size-4.5 sm:size-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>Include complete match headers showing team names and kickoff timers clearly.</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-2.5">
                <span className="size-4.5 sm:size-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>Ensure high screen brightness before capturing to prevent OCR character dropping.</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-2.5">
                <span className="size-4.5 sm:size-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Screenshots captured right before kickoff yield the highest seed probability accuracy.</span>
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
