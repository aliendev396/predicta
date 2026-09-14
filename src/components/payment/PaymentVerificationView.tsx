import { useState, useEffect } from "react";
import {
  Check,
  Clock,
  XCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Zap,
  ShieldCheck,
  Terminal as TerminalIcon,
  Sparkles,
  Lock,
} from "lucide-react";
import { ghs } from "@/lib/data";
import { LogoSymbol } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export interface PaymentVerificationViewProps {
  status: "pending" | "approved" | "rejected";
  title?: string | null | undefined;
  amountGhs: number;
  credits?: number | undefined;
  packageName?: string | null | undefined;
  senderName: string;
  reference?: string | null | undefined;
  method?: string | null | undefined;
  adminNote?: string | null | undefined;
  onRetry?: (() => void) | undefined;
  onContinue?: (() => void) | undefined;
  redirectCountdownSeconds?: number | undefined;
  isRegistration?: boolean | undefined;
  embedded?: boolean | undefined;
}

const TELEMETRY_LINES = [
  "CONNECTING SECURE MOBILE MONEY SETTLEMENT LEDGER...",
  "MATCHING SENDER CREDENTIALS AGAINST DEPOSIT FEED...",
  "SYNCHRONIZING ZERO-KNOWLEDGE AUDIT TRAIL...",
  "VERIFYING TRANSACTION INTEGRITY & SIGNATURE...",
  "AWAITING ADMIN AUTHORIZATION & VAULT CLEARANCE...",
];

export function PaymentVerificationView({
  status,
  title,
  amountGhs,
  credits = 0,
  packageName,
  senderName,
  reference,
  method = "MTN Mobile Money",
  adminNote,
  onRetry,
  onContinue,
  redirectCountdownSeconds = 3,
  isRegistration = false,
  embedded = false,
}: PaymentVerificationViewProps) {
  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const [copiedRef, setCopiedRef] = useState(false);
  const [countdown, setCountdown] = useState(redirectCountdownSeconds);

  // Dynamic telemetry log cycling during pending state
  useEffect(() => {
    if (status !== "pending") return;
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_LINES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [status]);

  // Countdown timer for approved state auto-redirect
  useEffect(() => {
    if (status !== "approved") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, onContinue]);

  const handleCopyRef = () => {
    if (!reference) return;
    navigator.clipboard?.writeText(reference).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
  };

  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending = status === "pending";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden transition-all box-border",
        embedded
          ? "bg-transparent p-0 border-0 shadow-none"
          : "max-w-xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-lg sm:shadow-xl"
      )}
    >
      {/* Dynamic Ambient Background Aura */}
      <div
        className={cn(
          "pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 sm:w-80 h-48 sm:h-80 rounded-full blur-[60px] sm:blur-[90px] transition-all duration-1000",
          isApproved
            ? "bg-emerald-500/20 scale-125"
            : isRejected
            ? "bg-red-600/20 scale-125"
            : "bg-red-500/15 scale-100 animate-pulse"
        )}
      />

      {/* Top Banner Telemetry Strip */}
      {!embedded && (
        <div className="relative z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3.5 sm:px-5 py-2 text-[10px] sm:text-[11px] font-mono font-semibold">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                isApproved
                  ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                  : isRejected
                  ? "bg-red-600 shadow-[0_0_8px_#dc2626]"
                  : "bg-red-600 animate-ping"
              )}
            />
            <span className="tracking-wider uppercase text-slate-700 truncate min-w-0">
              {isApproved
                ? "LEDGER: VERIFIED"
                : isRejected
                ? "LEDGER: DECLINED"
                : "LEDGER: VERIFYING REALTIME"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 ml-2">
            <Lock className="size-2.5 sm:size-3" />
            <span className="hidden xs:inline">256-BIT ENCRYPTED</span>
          </div>
        </div>
      )}

      <div className={cn("relative z-10 space-y-3.5 sm:space-y-5", embedded ? "p-0.5 sm:p-2" : "p-3.5 sm:p-6")}>
        {/* ========================================================================= */}
        {/* 1. VERIFICATION IN PROGRESS (RADAR & SCANNING)                             */}
        {/* ========================================================================= */}
        {isPending && (
          <div className="space-y-3.5 sm:space-y-5 text-center">
            {/* High-Tech Rotating Radar Centerpiece */}
            <div className="relative mx-auto size-20 sm:size-28 flex items-center justify-center my-1">
              {/* Outer Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-red-500/20 animate-pulse" />
              <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-dashed border-red-500/30" />
              <div className="absolute inset-3 sm:inset-4 rounded-full border border-red-500/15" />
              
              {/* Expanding Ripple Waves */}
              <div className="absolute inset-0 rounded-full bg-red-500/10 animate-[radar-ping-custom_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

              {/* 360-Degree Rotating Radar Beam */}
              <div className="absolute inset-0 rounded-full overflow-hidden animate-[radar-sweep_4s_linear_infinite] pointer-events-none">
                <div className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left bg-gradient-to-tr from-transparent via-red-600/10 to-red-600/35 blur-xs" />
              </div>

              {/* Center Beacon */}
              <div className="relative size-9 sm:size-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-white shadow-lg shadow-red-600/20 border border-red-500/40">
                <Clock className="size-4 sm:size-5 text-red-500 animate-spin" style={{ animationDuration: "6s" }} />
              </div>
            </div>

            {/* Status Headings */}
            <div className="space-y-1 max-w-lg mx-auto px-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-widest">
                <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />
                AUTOMATIC REALTIME SYNC
              </div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-950">
                {title ?? (isRegistration ? "VERIFYING ACTIVATION" : "VERIFYING PAYMENT")}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Payment of <strong className="text-slate-950 font-mono font-bold">{ghs(amountGhs)}</strong> from{" "}
                <span className="font-semibold text-slate-900 font-mono break-all">"{senderName}"</span> is matching against the MoMo ledger. Unlocks automatically.
              </p>
            </div>

            {/* Live Terminal Telemetry Ticker */}
            <div className="bg-slate-950 text-emerald-400 rounded-xl p-2.5 sm:p-3 border border-slate-800 text-left font-mono text-[9px] sm:text-[11px] flex items-center gap-2 shadow-inner overflow-hidden">
              <TerminalIcon className="size-3.5 shrink-0 text-red-500 animate-pulse" />
              <div className="truncate flex-1 min-w-0">
                <span className="text-slate-500 mr-1.5 font-bold hidden xs:inline">// SECURE:</span>
                <span className="transition-all duration-300 tracking-wide">
                  {TELEMETRY_LINES[telemetryIndex]}
                </span>
              </div>
            </div>

            {/* 3-Stage Progress Timeline */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-0.5">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-1.5 sm:p-2 text-center space-y-0.5">
                <div className="size-4.5 sm:size-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-[10px] font-bold">
                  <Check className="size-3" />
                </div>
                <p className="text-[9px] font-mono font-bold uppercase text-slate-700">1. Paid</p>
                <p className="text-[8px] text-slate-400 font-mono truncate">Logged</p>
              </div>

              <div className="rounded-xl bg-red-50/80 border border-red-200 p-1.5 sm:p-2 text-center space-y-0.5 relative overflow-hidden">
                <div className="size-4.5 sm:size-5 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold animate-pulse">
                  <RefreshCw className="size-2.5 sm:size-3 animate-spin" />
                </div>
                <p className="text-[9px] font-mono font-bold uppercase text-red-700">2. Match</p>
                <p className="text-[8px] text-red-500 font-mono truncate">Scanning</p>
              </div>

              <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-1.5 sm:p-2 text-center space-y-0.5 opacity-60">
                <div className="size-4.5 sm:size-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-[10px] font-bold font-mono">
                  3
                </div>
                <p className="text-[9px] font-mono font-bold uppercase text-slate-600">3. Unlock</p>
                <p className="text-[8px] text-slate-400 font-mono truncate">Vault</p>
              </div>
            </div>

            {/* Transaction Manifest Details */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3.5 text-left text-[10px] sm:text-[11px] font-mono space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5 gap-2">
                <span className="text-slate-500 uppercase shrink-0 text-[10px] sm:text-[11px]">ITEM</span>
                <span className="font-bold text-slate-900 uppercase truncate text-right min-w-0">
                  {packageName ? `${packageName}` : isRegistration ? "ACTIVATION" : "TOP-UP"}
                </span>
              </div>
              {credits > 0 && (
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5 gap-2">
                  <span className="text-slate-500 uppercase shrink-0 text-[10px] sm:text-[11px]">CREDITS</span>
                  <span className="font-bold text-red-600 font-mono shrink-0">+{credits} SCANS</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5 gap-2">
                <span className="text-slate-500 uppercase shrink-0 text-[10px] sm:text-[11px]">AMOUNT</span>
                <span className="font-black text-slate-950 font-mono shrink-0">{ghs(amountGhs)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5 gap-2">
                <span className="text-slate-500 uppercase shrink-0 text-[10px] sm:text-[11px]">SENDER</span>
                <span className="font-bold text-slate-900 truncate text-right min-w-0">{senderName}</span>
              </div>
              {reference && reference !== "Not provided" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 uppercase shrink-0 text-[10px] sm:text-[11px]">REF</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800 min-w-0 truncate justify-end">
                    <span className="truncate min-w-0">{reference}</span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer shrink-0"
                      title="Copy Reference"
                    >
                      {copiedRef ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. APPROVED SLIDE-IN POPUP WITH WOW FACTOR                                */}
        {/* ========================================================================= */}
        {isApproved && (
          <div className="space-y-3.5 sm:space-y-4 text-center animate-[slide-in-bottom-smooth_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            {/* Glowing Emerald Hologram Beacon */}
            <div className="relative mx-auto size-14 sm:size-20 flex items-center justify-center my-1">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="absolute inset-1 rounded-full border-2 border-emerald-500/40 animate-[radar-sweep_6s_linear_infinite]" />
              <div className="relative size-11 sm:size-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 animate-[badge-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <Check className="size-5 sm:size-7 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1 max-w-md mx-auto px-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-extrabold uppercase tracking-widest">
                <Sparkles className="size-3 text-emerald-600" />
                CLEARANCE COMPLETED
              </span>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-950">
                {isRegistration ? "WORKSPACE ACTIVATED!" : "PAYMENT APPROVED!"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                {isRegistration
                  ? "Your one-time fee has been verified. Workspace unlocked."
                  : `Your deposit of ${ghs(amountGhs)} has been cleared and +${credits} credits deposited.`}
              </p>
            </div>

            {/* Glowing Reward Summary Card */}
            <div className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-3 sm:p-4 text-left font-mono space-y-1.5 sm:space-y-2 shadow-md shadow-emerald-500/10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-emerald-900 font-bold uppercase">STATUS</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                  <ShieldCheck className="size-3" /> VERIFIED
                </span>
              </div>
              {credits > 0 && (
                <div className="flex items-center justify-between border-t border-emerald-200/60 pt-1.5 gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-900 font-bold uppercase">ADDED</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700 font-sans flex items-center gap-1">
                    <Zap className="size-3.5 fill-emerald-600 text-emerald-600" />
                    +{credits} CREDITS
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-emerald-200/60 pt-1.5 gap-2">
                <span className="text-[10px] sm:text-xs text-emerald-900 font-bold uppercase">AMOUNT CLEARED</span>
                <span className="text-xs sm:text-sm font-black text-slate-950 font-sans">{ghs(amountGhs)}</span>
              </div>
            </div>

            {/* Action Button & Auto-redirect Countdown */}
            <div className="space-y-2 pt-0.5">
              <button
                type="button"
                onClick={onContinue}
                className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-full bg-slate-950 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98]"
              >
                <span className="truncate">{isRegistration ? "ENTER PREDICTA WORKSPACE" : "LAUNCH ANALYSIS WORKSPACE"}</span>
                <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400">
                  Forwarding in <span className="font-bold text-slate-900">{countdown}s</span>...
                </p>
                <div className="w-32 sm:w-44 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${((redirectCountdownSeconds - countdown) / redirectCountdownSeconds) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. REJECTED SLIDE-IN ALERT WITH WOW FACTOR                                 */}
        {/* ========================================================================= */}
        {isRejected && (
          <div className="space-y-3.5 sm:space-y-4 text-center animate-[slide-in-bottom-smooth_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            {/* Crimson Alert Beacon */}
            <div className="relative mx-auto size-14 sm:size-18 flex items-center justify-center my-1">
              <div className="absolute inset-0 rounded-full bg-red-600/20 blur-xl animate-pulse" />
              <div className="relative size-11 sm:size-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 animate-[badge-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <XCircle className="size-5 sm:size-7 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1 max-w-md mx-auto px-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[9px] font-mono font-extrabold uppercase tracking-widest">
                VERIFICATION DECLINED
              </span>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-950">
                PAYMENT NOT VERIFIED
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Could not match transaction. Review the reason and resubmit details.
              </p>
            </div>

            {/* Admin Note Explanation Box */}
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-2.5 sm:p-3.5 text-left font-mono space-y-1">
              <span className="text-[9px] font-bold text-red-800 uppercase tracking-widest block">
                ADMIN AUDIT REASON:
              </span>
              <p className="text-[11px] sm:text-xs text-red-950 font-sans font-medium leading-relaxed bg-white/80 p-2 sm:p-2.5 rounded-lg border border-red-200/60 break-words">
                {adminNote ||
                  "The transaction reference or MoMo sender name could not be matched against the statement. Please check and try again."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={onRetry}
                className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-full bg-slate-950 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <RefreshCw className="size-3.5" />
                <span>Modify Details & Resubmit</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Corner Watermark */}
      <LogoSymbol className="pointer-events-none absolute -bottom-6 -right-6 size-24 sm:size-36 opacity-[0.03] text-slate-950" />
    </div>
  );
}
