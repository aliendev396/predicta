import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { usePaymentRealtime } from "@/hooks/usePaymentRealtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { LogoSymbol, LogoWatermark } from "@/components/brand/Logo";
import { PaymentVerificationView } from "@/components/payment/PaymentVerificationView";
import { CountryPaymentTabs, PaymentCountry } from "@/components/payment/CountryPaymentTabs";
import { NigerianPaymentForm } from "@/components/payment/NigerianPaymentForm";
import { supabase } from "@/integrations/supabase/client";
import {
  creditHistoryQuery,
  getNgnPrice,
  ghs,
  ngn,
  packagesQuery,
  paymentSettingsQuery,
  paymentsQuery,
  profileQuery,
  uploadPaymentProof,
  verdictLimitQuery,
} from "@/lib/data";
import { checkPaymentRateLimit, formatRetryAfter } from "@/lib/rateLimit";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/credits")({
  head: () => ({
    meta: [
      { title: "Credits & Tiers — PREDICTA" },
      { name: "description", content: "Track your PREDICTA prediction credits and upgrade your access plan." },
      { property: "og:title", content: "Credits & Tiers — PREDICTA" },
      { property: "og:description", content: "Monitor your credit balance and upgrade your PREDICTA access plan." },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: payments } = useQuery(paymentsQuery(user.id));
  const hasPending = (payments ?? []).some((p) => p.status === "pending");
  const { data: profile } = useQuery({
    ...profileQuery(user.id),
    refetchInterval: hasPending ? 4000 : false,
  });
  const { data: packages } = useQuery(packagesQuery());
  const { data: history } = useQuery({
    ...creditHistoryQuery(user.id),
    refetchInterval: hasPending ? 4000 : false,
  });
  const { data: verdictLimit } = useQuery(verdictLimitQuery(user.id));
  usePaymentRealtime(user.id);

  const seen = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    if (!payments) return;
    const next = new Map(payments.map((p) => [p.id, p.status as string]));
    const prev = seen.current;
    seen.current = next;
    if (!prev) return;
    const justApproved = payments.find(
      (p) => p.status === "approved" && prev.get(p.id) === "pending",
    );
    if (justApproved) {
      void queryClient.invalidateQueries();
      toast.success(`Payment approved — ${justApproved.credits} credits added`);
      window.setTimeout(() => {
        void navigate({ to: "/analyze" });
      }, 1400);
    }
  }, [payments, navigate, queryClient]);

  const credits = profile?.credits ?? 0;
  const capacity = Math.max(
    credits,
    ...(packages ?? []).map((p) => p.credits),
    10,
  );
  const pct = capacity > 0 ? Math.min(100, Math.round((credits / capacity) * 100)) : 0;
  const spent = (history ?? []).reduce((sum, t) => (t.delta < 0 ? sum - t.delta : sum), 0);
  const pending = (payments ?? []).filter((p) => p.status === "pending").length;
  const low = credits <= 2;

  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  const handleCopyRef = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRefId(id);
      toast.success("Reference copied to clipboard");
      setTimeout(() => setCopiedRefId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-10 selection:bg-red-600 selection:text-white pb-12">
      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-[11px] font-bold tracking-widest uppercase shadow-2xs">
          <Coins className="size-3.5" />
          PREDICTA CREDIT VAULT
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 uppercase tracking-tight">
          CREDITS & ACCESS TIERS.
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl font-normal leading-relaxed">
          One credit powers one instant PREDICTA virtual match scan with real-time seed decoding.
        </p>
      </div>

      {/* Top Section: Obsidian Balance Hero Card & Mini Stat */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 text-white p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:col-span-2">
          {/* Ambient Red Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-red-600/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-60 rounded-full bg-red-900/10 blur-[80px]" />
          <LogoWatermark className="opacity-[0.06] text-white" />
          <LogoSymbol
            className="pointer-events-none absolute right-8 top-8 h-8 w-auto text-white opacity-25"
            aria-hidden
          />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-slate-200">
                <Coins className="size-3.5 text-red-500" /> AVAILABLE BALANCE
              </span>
              {low && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest animate-pulse shadow-md">
                  <Sparkles className="size-3" /> TOP-UP RECOMMENDED
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3 sm:gap-4 pt-2">
              <p className="text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight font-sans text-white break-words">{credits}</p>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-300">Scan Credits Active</p>
                <p className="text-xs text-slate-400">1 credit deducted per screenshot match scan</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md">
                Active Tier: <span className="font-mono font-bold text-red-400">{verdictLimit ?? 2} verdicts</span> per screenshot
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <Progress
                value={pct}
                className="h-3 bg-slate-800/80 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-500 [&>div]:transition-all [&>div]:duration-700"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 pt-1">
                <span>{pct}% OF TOP-UP CAPACITY</span>
                <span>{capacity} MAX CREDITS</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <UpgradeDialog />
              {pending > 0 && (
                <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
                  <Clock className="size-3.5 animate-spin" />
                  {pending} payment{pending === 1 ? "" : "s"} awaiting approval
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Mini Stat Card */}
        <div className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                CREDITS CONSUMED
              </span>
              <div className="size-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <Zap className="size-4" />
              </div>
            </div>
            <p className="mt-6 text-5xl font-black tracking-tight text-slate-950 font-sans">{spent}</p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal">
              Total verdict calculations delivered to your account since activation.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>CONSUMPTION RATE</span>
            <span className="font-bold text-slate-950">1 CREDIT / SCAN</span>
          </div>
        </div>
      </div>

      {/* Bottom Log Tables Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Payment Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
                TRANSACTION AUDIT
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-950">
                PAYMENT REQUESTS
              </h2>
            </div>
            {(payments ?? []).length > 0 && (
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {(payments ?? []).length} TOTAL
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {(payments ?? []).length === 0 && (
              <div className="p-10 text-center space-y-3">
                <Coins className="mx-auto size-10 text-slate-300" />
                <p className="text-base font-extrabold uppercase tracking-tight text-slate-950">
                  No payments submitted yet
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Select an access tier above to unlock prediction scan credits via Mobile Money or Bank Transfer.
                </p>
              </div>
            )}
            {(payments ?? []).map((p) => {
              const isNgn =
                (p.method || "").includes("Nigeria") ||
                (p.method || "").includes("Fidelity") ||
                (p.reference || "").toLowerCase().includes("ngn");
              const ngnPrice = getNgnPrice(p.amount_ghs);

              const proofMatch = (p.reference || "").match(/Proof:\s*(https?:\/\/[^\s]+|data:image\/[^\s]+)/);
              const proofUrl = proofMatch
                ? proofMatch[1]
                : ((p.reference || "").startsWith("http") || (p.reference || "").startsWith("data:image")
                  ? p.reference
                  : null);
              const rawRef = (p.reference || "")
                .replace(/\|?\s*Proof:\s*(https?:\/\/[^\s]+|data:image\/[^\s]+)/, "")
                .trim();
              const cleanRef =
                rawRef && rawRef !== "Not provided" && !rawRef.startsWith("data:image") ? rawRef : null;

              return (
                <div
                  key={p.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xl font-black tracking-tight text-slate-950 font-sans">
                          {isNgn ? ngn(ngnPrice) : ghs(p.amount_ghs)}
                        </span>
                        {isNgn && (
                          <span className="text-xs font-mono text-slate-400 font-medium">
                            ({ghs(p.amount_ghs)} equiv)
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
                          +{p.credits} CREDITS
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {isNgn ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span>🇳🇬</span> Fidelity Bank Transfer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>🇬🇭</span> {p.method}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(p.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={cn(
                        "font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs border",
                        p.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {p.status === "approved" && <CheckCircle2 className="size-3.5 mr-1" />}
                      {p.status === "pending" && <Clock className="size-3.5 mr-1 animate-spin text-amber-600" />}
                      {p.status === "rejected" && <XCircle className="size-3.5 mr-1 text-red-600" />}
                      {p.status === "pending" ? "PENDING APPROVAL" : p.status === "approved" ? "APPROVED" : "DECLINED"}
                    </Badge>
                  </div>

                  {/* Transaction Details & Sender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/70 border border-slate-100 p-3 rounded-2xl">
                    <div>
                      <span className="text-slate-400 font-mono text-[11px] uppercase block">Sender Account</span>
                      <span className="font-bold text-slate-900">{p.sender_name || "Not provided"}</span>
                    </div>
                    {cleanRef && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 font-mono text-[11px] uppercase block">Reference</span>
                          <span className="font-mono font-semibold text-slate-800">{cleanRef}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyRef(cleanRef, p.id)}
                          className="size-7 p-0 text-slate-400 hover:text-slate-700"
                          title="Copy reference"
                        >
                          {copiedRefId === p.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Payment Receipt Proof Preview */}
                  {proofUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewProofUrl(proofUrl)}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pr-4 hover:border-red-300 hover:bg-red-50/30 transition-all cursor-pointer shadow-2xs text-left w-fit"
                      >
                        <div className="size-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center">
                          <img
                            src={proofUrl}
                            alt="Payment receipt proof preview"
                            className="size-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <ImageIcon className="size-3.5 text-red-600" />
                            Receipt Screenshot Attached
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Click to view full payment proof
                          </p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Admin note banner */}
                  {p.admin_note && (
                    <div className="text-xs text-slate-700 bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                      <span className="font-bold text-amber-900 shrink-0 font-mono uppercase text-[10px]">Admin Note:</span>
                      <span>{p.admin_note}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Credit Ledger Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
                REALTIME LEDGER
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-950">
                CREDIT LEDGER
              </h2>
            </div>
            {(history ?? []).length > 0 && (
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {(history ?? []).length} ENTRIES
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {(history ?? []).length === 0 && (
              <div className="p-8 text-center space-y-2">
                <Zap className="mx-auto size-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-950">No credit activity logged</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your credit additions and match scan deductions will appear here in real time.
                </p>
              </div>
            )}
            {(history ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-900">{t.reason}</p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-base font-mono font-black",
                    t.delta > 0 ? "text-red-600" : "text-slate-400",
                  )}
                >
                  {t.delta > 0 ? "+" : ""}
                  {t.delta}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Receipt Proof Lightbox Dialog */}
      <Dialog open={!!previewProofUrl} onOpenChange={(isOpen) => !isOpen && setPreviewProofUrl(null)}>
        <DialogContent className="max-w-xl rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
          <DialogHeader className="space-y-1 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 font-mono text-[10px] font-bold uppercase tracking-wider w-fit">
              <ImageIcon className="size-3.5" />
              PAYMENT RECEIPT PROOF
            </div>
            <DialogTitle className="text-xl font-extrabold uppercase tracking-tight text-slate-950">
              Uploaded Bank Screenshot
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Proof of bank transfer submitted for account verification.
            </DialogDescription>
          </DialogHeader>

          {previewProofUrl && (
            <div className="mt-4 space-y-4">
              <div className="relative max-h-[60vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-950/5 p-2 flex items-center justify-center">
                <img
                  src={previewProofUrl}
                  alt="Uploaded payment proof receipt"
                  className="max-h-[55vh] w-auto max-w-full rounded-xl object-contain shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewProofUrl(null)}
                  className="rounded-full px-5 text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  asChild
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white px-5 text-xs font-bold uppercase tracking-wider border-0"
                >
                  <a href={previewProofUrl} target="_blank" rel="noreferrer" download="payment-proof">
                    <ExternalLink className="mr-1.5 size-3.5" />
                    Open Full Image
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UpgradeDialog() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: packages } = useQuery(packagesQuery());
  const { data: settings } = useQuery(paymentSettingsQuery());
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [country, setCountry] = useState<PaymentCountry>("ghana");
  const [selected, setSelected] = useState<string | null>(null);
  const method = settings?.network ?? "MTN MoMo";
  const [senderName, setSenderName] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const { data: livePayments } = useQuery({
    ...paymentsQuery(user.id),
    refetchInterval: paymentId ? 3000 : false,
  });
  const livePayment = paymentId ? (livePayments ?? []).find((p) => p.id === paymentId) : undefined;
  const approved = livePayment?.status === "approved";
  const rejected = livePayment?.status === "rejected";

  const pkg = (packages ?? []).find((p) => p.id === selected) ?? null;

  const [momoCopied, setMomoCopied] = useState(false);
  const handleCopyMomo = async () => {
    const num = settings?.momo_number;
    if (!num) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(num);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = num;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setMomoCopied(true);
      toast.success("Payment number copied!");
      setTimeout(() => setMomoCopied(false), 2200);
    } catch {
      toast.error("Please copy the number manually.");
    }
  };

  const reset = () => {
    setStep(1);
    setSelected(null);
    setSenderName("");
    setPaymentId(null);
    setMomoCopied(false);
  };

  const submit = useMutation({
    mutationFn: async () => {
      const rl = checkPaymentRateLimit(user.id);
      if (!rl.allowed) {
        throw new Error(`Submission limit reached (max 7 per hour). Please wait ${formatRetryAfter(rl.retryAfterSeconds)} before submitting again.`);
      }

      if (!pkg) throw new Error("Choose a package first.");
      const name = senderName.trim();
      if (name.length < 2 || name.length > 80) {
        throw new Error("Enter the MoMo name on the account you paid from (2-80 characters).");
      }
      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          package_id: pkg.id,
          amount_ghs: pkg.price_ghs,
          credits: pkg.credits,
          kind: "package",
          method,
          sender_name: name,
          reference: "Not provided",
        })
        .select("id")
        .single();
      if (error) {
        if (error.message.includes("RATE_LIMITED")) {
          throw new Error("Too many payment submissions (max 7 per hour). Please wait before trying again.");
        }
        throw new Error(error.message);
      }
      return data.id as string;
    },
    onSuccess: async (id: string) => {
      setPaymentId(id);
      setStep(3);
      void supabase.channel("admin-realtime-websocket").send({
        type: "broadcast",
        event: "payment-submitted",
        payload: { userId: user.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["payments", user.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitNigerian = useMutation({
    mutationFn: async ({
      senderName,
      reference,
      proofFile,
    }: {
      senderName: string;
      reference: string;
      proofFile: File | null;
    }) => {
      const rl = checkPaymentRateLimit(user.id);
      if (!rl.allowed) {
        throw new Error(
          `Submission limit reached (max 7 per hour). Please wait ${formatRetryAfter(
            rl.retryAfterSeconds
          )} before submitting again.`
        );
      }

      if (!pkg) throw new Error("Choose a package first.");
      const name = senderName.trim();
      if (name.length < 2 || name.length > 80) {
        throw new Error("Enter the bank account name you transferred from (2-80 characters).");
      }

      let proofUrl = "";
      if (proofFile) {
        proofUrl = await uploadPaymentProof(user.id, proofFile);
      }

      const refString = proofUrl
        ? `${reference ? `${reference} | ` : ""}Proof: ${proofUrl}`
        : reference || "Not provided";

      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          package_id: pkg.id,
          amount_ghs: pkg.price_ghs,
          credits: pkg.credits,
          kind: "package",
          method: "Bank Transfer (Nigeria - Fidelity Bank)",
          sender_name: name,
          reference: refString,
        })
        .select("id")
        .single();

      if (error) {
        if (error.message.includes("RATE_LIMITED")) {
          throw new Error("Too many payment submissions (max 7 per hour). Please wait before trying again.");
        }
        throw new Error(error.message);
      }
      return data.id as string;
    },
    onSuccess: async (id: string) => {
      setPaymentId(id);
      setStep(3);
      void supabase.channel("admin-realtime-websocket").send({
        type: "broadcast",
        event: "payment-submitted",
        payload: { userId: user.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["payments", user.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });


  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white rounded-full px-7 py-3.5 font-bold uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 border-0 cursor-pointer"
        >
          Upgrade Plan Tiers
          <ArrowUpRight className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-full max-w-full max-h-[92vh] overflow-y-auto overflow-x-hidden sm:max-w-4xl lg:max-w-5xl rounded-2xl sm:rounded-3xl bg-white border border-slate-200 p-4 sm:p-8 lg:p-10 selection:bg-red-600 selection:text-white mobile-contain">
        <DialogHeader className="space-y-1.5 sm:space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 sm:py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-[9px] sm:text-[10px] font-bold tracking-widest uppercase w-fit">
            PREDICTA BILLING CHECKOUT
          </div>
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-slate-950">
            {step === 1 ? "SELECT ACCESS TIER" : step === 2 ? "CONFIRM PAYMENT DETAILS" : "VERIFICATION IN PROGRESS"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs sm:text-sm font-normal">
            {step === 1
              ? "Step 1 of 3 — Pick the prediction scan capacity that fits your daily match frequency."
              : step === 2
                ? "Step 2 of 3 — Send exact amount via Mobile Money and enter your account sender name."
                : "Step 3 of 3 — Payment logged and queued for instant admin approval."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator Bar */}
        <div className="my-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-500",
                s <= step ? "bg-red-600" : "bg-slate-100",
              )}
            />
          ))}
        </div>

        {/* Country Selector Tabs (Ghanaians vs Nigerians) */}
        <div className="mb-2">
          <CountryPaymentTabs country={country} onChange={setCountry} />
        </div>

        {/* Step 1: Package Selection Cards Replicating Homepage Design */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
            {(packages ?? []).map((pkg) => {
              const popular = pkg.is_popular === true;
              const ngnPrice = getNgnPrice(pkg.price_ghs);
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelected(pkg.id);
                    setStep(2);
                  }}
                  className={cn(
                    "rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group cursor-pointer text-left relative",
                    popular
                      ? "bg-gradient-to-b from-slate-900 to-slate-950 text-white border-2 border-red-600 shadow-[0_20px_50px_rgba(228,24,39,0.25)] scale-[1.02]"
                      : "bg-white text-slate-950 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300"
                  )}
                >
                  {popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                      MOST POPULAR ACCESS
                    </span>
                  )}

                  <div>
                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-mono font-bold tracking-widest uppercase opacity-80">
                        {pkg.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight font-sans">
                          {country === "nigeria" ? ngn(ngnPrice) : ghs(pkg.price_ghs)}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 pt-1 font-mono">
                        {pkg.credits} match scan credits {country === "nigeria" && `(GH₵${pkg.price_ghs} equiv)`}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold",
                        popular
                          ? "bg-red-500/20 border border-red-500/30 text-red-300"
                          : "bg-slate-100 border border-slate-200 text-slate-700"
                      )}
                    >
                      <Zap className={cn("size-3.5", popular ? "text-red-400" : "text-red-600")} />
                      {pkg.max_verdicts} verdict{pkg.max_verdicts === 1 ? "" : "s"} per scan
                    </div>

                    <div className={cn("my-6 border-t pt-5 space-y-2.5", popular ? "border-white/10" : "border-slate-100")}>
                      {((pkg.perks as string[]) ?? []).map((perk) => (
                        <div key={perk} className="flex items-center gap-2.5 text-xs font-medium">
                          <Check className={cn("size-4 shrink-0", popular ? "text-red-500" : "text-red-600")} />
                          <span className={popular ? "opacity-90" : "text-slate-600"}>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={cn(
                      "w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer",
                      popular
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 group-hover:scale-[1.02]"
                        : "bg-slate-950 group-hover:bg-red-600 text-white shadow-md"
                    )}
                  >
                    Choose {pkg.name}
                    <ArrowUpRight className="size-4" />
                  </button>
                </div>
              );
            })}
            {(packages ?? []).length === 0 && (
              <p className="text-sm text-slate-500 col-span-3 text-center py-8">
                No access packages configured in backend.
              </p>
            )}
          </div>
        )}

        {/* Step 2: Payment Details Form */}
        {step === 2 && pkg && (
          <div className="mt-4 space-y-6">
            {country === "nigeria" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-full border-slate-300 font-bold uppercase tracking-wider text-xs px-5 py-2 hover:bg-slate-100"
                  >
                    <ArrowLeft className="mr-1.5 size-4" /> Change Package
                  </Button>
                  <span className="text-xs font-mono font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {pkg.name} Package selected
                  </span>
                </div>
                <NigerianPaymentForm
                  amountNgn={getNgnPrice(pkg.price_ghs)}
                  amountGhs={pkg.price_ghs}
                  packageName={pkg.name}
                  isPending={submitNigerian.isPending}
                  onSubmit={(payload) => {
                    setSenderName(payload.senderName);
                    submitNigerian.mutate(payload);
                  }}
                />
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit.mutate();
                }}
              >
                {/* Selected Package Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 border border-slate-800 shadow-md">
                  <LogoWatermark className="opacity-[0.05] text-white" />
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase">
                        SELECTED PACKAGE
                      </span>
                      <h3 className="text-2xl font-black tracking-tight text-white uppercase">{pkg.name} ACCESS</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {pkg.credits} scan credits · Up to {pkg.max_verdicts} verdicts per scan
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black tracking-tight text-white">{ghs(pkg.price_ghs)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Recipient Info Box */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                        PAY TO ({settings?.network ?? "MOBILE MONEY"})
                      </p>
                      <p className="text-2xl font-black tracking-tight text-slate-950 font-mono mt-0.5">
                        {settings?.momo_number ?? "—"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleCopyMomo}
                      className="bg-red-600 hover:bg-slate-950 text-white font-mono text-xs font-bold rounded-full px-5 py-2.5 flex items-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer border-0"
                    >
                      {momoCopied ? (
                        <span className="flex items-center gap-1.5 font-bold">
                          <Check className="size-4" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Copy className="size-4" /> Copy Number
                        </span>
                      )}
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">ACCOUNT NAME</p>
                      <p className="text-sm font-extrabold text-slate-950 mt-0.5">{settings?.recipient_name ?? "—"}</p>
                    </div>
                    {settings?.instructions && (
                      <div>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">INSTRUCTIONS</p>
                        <p className="text-xs text-slate-600 mt-0.5">{settings.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Input Section */}
                <div className="grid gap-4 sm:grid-cols-2 rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Payment Method
                    </Label>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                      <span className="text-sm font-bold text-slate-900 font-mono">{method}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Your MoMo Account Name
                    </Label>
                    <Input
                      id="sender"
                      value={senderName}
                      maxLength={80}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Name registered on the paying MoMo account"
                      className="h-12 rounded-xl border-slate-200 focus:border-red-600 focus:ring-red-600/20 text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-full border-slate-300 font-bold uppercase tracking-wider text-xs px-6 py-3.5 h-auto hover:bg-slate-100"
                  >
                    <ArrowLeft className="mr-1.5 size-4" /> Change Package
                  </Button>
                  <Button
                    type="submit"
                    disabled={submit.isPending}
                    className="flex-1 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold uppercase tracking-wider text-xs px-8 py-3.5 h-auto shadow-lg shadow-red-600/25 transition-all border-0 cursor-pointer"
                  >
                    {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Confirm & Submit Payment
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}


        {/* Step 3: Redesigned High-Artistry Verification & Slide-in Popups */}
        {step === 3 && (
          <div className="mt-2 sm:mt-4">
            <PaymentVerificationView
              embedded={true}
              status={approved ? "approved" : rejected ? "rejected" : "pending"}
              amountGhs={pkg?.price_ghs ?? 0}
              credits={pkg?.credits ?? 0}
              packageName={pkg?.name}
              senderName={senderName}
              reference={livePayment?.reference ?? "Not provided"}
              method={method}
              adminNote={livePayment?.admin_note}
              onRetry={() => {
                setStep(2);
              }}
              onContinue={() => {
                setOpen(false);
                reset();
                void navigate({ to: "/analyze" });
              }}
              redirectCountdownSeconds={4}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <dt className="text-slate-400 font-bold">{label}</dt>
      <dd className="text-right font-bold text-slate-900">{value || "—"}</dd>
    </div>
  );
}

