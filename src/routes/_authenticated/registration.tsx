import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Copy, Loader2, ShieldCheck, XCircle, ArrowUpRight, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoFull } from "@/components/brand/Logo";
import { PaymentVerificationView } from "@/components/payment/PaymentVerificationView";
import { usePaymentRealtime } from "@/hooks/usePaymentRealtime";
import { supabase } from "@/integrations/supabase/client";
import { ghs, paymentSettingsQuery, profileQuery, registrationPaymentQuery } from "@/lib/data";
import { checkPaymentRateLimit, formatRetryAfter } from "@/lib/rateLimit";

export const Route = createFileRoute("/_authenticated/registration")({
  head: () => ({
    meta: [
      { title: "Registration Fee — PREDICTA" },
      {
        name: "description",
        content:
          "Complete your one-time PREDICTA registration fee to unlock credits and instant virtual football verdicts.",
      },
    ],
  }),
  component: RegistrationFeePage,
});

function RegistrationFeePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(paymentSettingsQuery());
  const { data: pending } = useQuery(registrationPaymentQuery(user.id));
  const isPending = pending?.status === "pending";
  const { data: profile } = useQuery({
    ...profileQuery(user.id),
    refetchInterval: isPending ? 4000 : false,
  });
  usePaymentRealtime(user.id);

  const method = settings?.network ?? "MTN MoMo";
  const [senderName, setSenderName] = useState("");
  const [reference, setReference] = useState("");
  const [dismissedDecline, setDismissedDecline] = useState(false);
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

  const fee = Number(settings?.registration_fee_ghs ?? 50);
  const approved = !!pending && pending.status === "approved";
  const submitted = !!pending && (pending.status === "pending" || approved);
  const rejected = !!pending && pending.status === "rejected";
  const showDeclined = rejected && !dismissedDecline;

  const { isAdmin, isPartner } = Route.useRouteContext();
  const isPartnerApplicant =
    (profile as any)?.partner_applicant === true ||
    user.user_metadata?.["partner_applicant"] === "true" ||
    user.user_metadata?.["partner_applicant"] === true;

  useEffect(() => {
    if (isPartner) {
      void navigate({ to: "/partner", replace: true });
      return;
    }
    if (isPartnerApplicant) {
      void navigate({ to: "/partner-apply", replace: true });
      return;
    }
    if (!profile?.registration_paid && !isAdmin) return;
    toast.success(isAdmin ? "Access granted — welcome to PREDICTA!" : "Registration approved — welcome to PREDICTA!");
    const timer = window.setTimeout(() => {
      void navigate({ to: "/credits", replace: true });
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [profile?.registration_paid, isAdmin, isPartner, isPartnerApplicant, navigate]);

  const submit = useMutation({
    mutationFn: async () => {
      const rl = checkPaymentRateLimit(user.id);
      if (!rl.allowed) {
        throw new Error(`Submission limit reached. Please wait before submitting again.`);
      }

      const name = senderName.trim();
      if (name.length < 2 || name.length > 80) {
        throw new Error("Enter the MoMo name on the account you paid from (2-80 characters).");
      }
      const ref = reference.trim();
      if (ref.length > 80) throw new Error("Transaction reference is too long.");
      const { error } = await supabase.from("payments").insert({
        user_id: user.id,
        amount_ghs: fee,
        credits: 0,
        kind: "registration",
        method,
        sender_name: name,
        reference: ref || "Not provided",
      });
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      void supabase.channel("admin-realtime-websocket").send({
        type: "broadcast",
        event: "payment-submitted",
        payload: { userId: user.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["registration-payment", user.id] });
      toast.success("Submitted — an admin will approve shortly.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="min-h-screen w-full max-w-full bg-slate-50/60 text-slate-950 font-sans selection:bg-red-600 selection:text-white py-6 sm:py-12 px-3 sm:px-6 lg:px-8 flex flex-col justify-between relative overflow-hidden overflow-x-hidden mobile-contain">
      {/* Background Red Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10 space-y-4 sm:space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
          <LogoFull className="h-7 sm:h-8 w-auto text-slate-950" />
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest shadow-sm">
            <Zap className="w-3 h-3 text-red-600 animate-pulse" />
            <span>ACCOUNT ACTIVATION</span>
          </div>
        </div>

        {/* State Content */}
        {showDeclined || submitted ? (
          <PaymentVerificationView
            status={approved ? "approved" : rejected ? "rejected" : "pending"}
            title={approved ? "WORKSPACE ACTIVATION APPROVED" : rejected ? "ACTIVATION DECLINED" : "VERIFYING ACCOUNT ACTIVATION"}
            amountGhs={pending?.amount_ghs ?? fee}
            credits={0}
            packageName="PREDICTA PLATFORM ACCESS"
            senderName={pending?.sender_name ?? "—"}
            reference={pending?.reference ?? "Not provided"}
            method={pending?.method ?? method}
            adminNote={pending?.admin_note}
            isRegistration={true}
            onRetry={() => setDismissedDecline(true)}
            onContinue={() => void navigate({ to: "/credits", replace: true })}
            redirectCountdownSeconds={3}
          />
        ) : (
          <>
            {/* Hero Card — Clean Light Editorial White Style */}
            <div className="rounded-2xl sm:rounded-3xl bg-white text-slate-950 p-4 sm:p-8 border border-slate-200/90 shadow-xl relative overflow-hidden space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> ONE-TIME FEE
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  UNPAID
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight uppercase text-slate-950">
                  ACTIVATION REQUIRED
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
                  Pay {ghs(fee)} once to activate your PREDICTA workspace. Once approved, your account unlocks instant seed feeds.
                </p>
              </div>

              <div className="pt-2 sm:pt-3 flex items-baseline gap-2 border-t border-slate-100">
                <span className="text-4xl sm:text-5xl font-black font-mono text-red-600 tracking-tight">
                  {ghs(fee)}
                </span>
                <span className="text-xs font-mono text-slate-500 uppercase font-semibold">One-Time Fee</span>
              </div>
            </div>

            <form
              className="space-y-4 sm:space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate();
              }}
            >
            {/* Copy Payment Info Card — Clean White/Slate */}
            <div className="bg-white text-slate-950 rounded-3xl p-6 border border-slate-200/90 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">PAYMENT DESTINATION</span>
                  <span className="text-sm font-bold text-slate-900">{settings?.network ?? "MTN Mobile Money"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMomo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-slate-950 text-white font-mono text-xs font-bold transition-all shadow-sm"
                >
                  {momoCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> COPY NUMBER
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 font-semibold uppercase">MOMO NUMBER:</span>
                <span className="text-xl font-mono font-extrabold text-red-600 tracking-wider">
                  {settings?.momo_number ?? "0551234567"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-mono text-slate-500 font-semibold uppercase">RECIPIENT NAME:</span>
                <span className="text-xs font-bold text-slate-900 uppercase">{settings?.recipient_name ?? "PREDICTA PLATFORM"}</span>
              </div>

              {settings?.instructions && (
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {settings.instructions}
                </p>
              )}
            </div>

            {/* Input Submission Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sender" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Money Account Name
                </Label>
                <Input
                  id="sender"
                  value={senderName}
                  maxLength={80}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Name on the MoMo account you paid from"
                  required
                  className="bg-slate-50 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl h-12 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Transaction Reference (Optional)
                </Label>
                <Input
                  id="ref"
                  value={reference}
                  maxLength={80}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. Transaction ID / Ref number"
                  className="bg-slate-50 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl h-12 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submit.isPending}
                className="w-full h-12 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-red-600/20 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
              >
                {submit.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Verification...
                  </span>
                ) : (
                  <>
                    Confirm Payment of {ghs(fee)}
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          </>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 mt-8 font-mono">
        © PREDICTA PLATFORM · 256-BIT ENCRYPTED SESSION
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500 uppercase font-semibold">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}
