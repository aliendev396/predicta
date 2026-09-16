import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Handshake, Loader2, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoFull, LogoSymbol, LogoWatermark } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { partnerApplicationQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/partner-apply")({
  head: () => ({
    meta: [
      { title: "Partner Application — PREDICTA" },
      {
        name: "description",
        content: "Apply to become a verified PREDICTA partner and earn commission on every member you refer.",
      },
      { property: "og:title", content: "Partner Application — PREDICTA" },
      { property: "og:description", content: "Apply to become a verified PREDICTA partner." },
    ],
  }),
  component: PartnerApplyPage,
});

function PartnerApplyPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: application, isLoading } = useQuery({
    ...partnerApplicationQuery(user.id),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const [audience, setAudience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("MTN MoMo");
  const [payoutDetails, setPayoutDetails] = useState("");

  // Live approval: no refresh needed
  useEffect(() => {
    const channel = supabase
      .channel(`partner-app-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_applications", filter: `user_id=eq.${user.id}` },
        () => void queryClient.invalidateQueries({ queryKey: ["partner-application", user.id] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => void queryClient.invalidateQueries({ queryKey: ["partner-application", user.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user.id, queryClient]);

  const isInviteApplicant =
    user.user_metadata?.["partner_applicant"] === "true" ||
    user.user_metadata?.["partner_applicant"] === true;
  const status = application?.status ?? (isInviteApplicant ? "pending" : null);

  useEffect(() => {
    if (status !== "approved") return;
    const t = setTimeout(() => void navigate({ to: "/partner", replace: true }), 1400);
    return () => clearTimeout(t);
  }, [status, navigate]);

  const submit = useMutation({
    mutationFn: async () => {
      if (audience.trim().length < 3) throw new Error("Tell us about your audience.");
      if (motivation.trim().length < 10) throw new Error("Tell us why you want to partner with PREDICTA.");
      if (payoutDetails.trim().length < 5) throw new Error("Add your payout number or account details.");
      const { error } = await supabase.from("partner_applications").insert({
        user_id: user.id,
        audience: audience.trim().slice(0, 300),
        motivation: motivation.trim().slice(0, 1000),
        payout_method: payoutMethod,
        payout_details: payoutDetails.trim().slice(0, 200),
        status: "pending",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["partner-application", user.id] });
      toast.success("Application submitted for review");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 min-w-0 overflow-x-hidden py-8 selection:bg-red-600 selection:text-white">
      <div className="flex justify-center mb-6">
        <LogoFull className="h-8 w-auto" />
      </div>

      {status === "rejected" ? (
        <section className="relative mt-6 overflow-hidden rounded-3xl border-2 border-red-200 bg-red-50 p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <ShieldX className="mx-auto size-12 text-red-600" />
          <h1 className="text-3xl font-black uppercase tracking-tight text-red-900">APPLICATION DECLINED</h1>
          <p className="text-sm text-red-700 max-w-md mx-auto">
            Unfortunately, your partner application could not be approved at this time.
          </p>
          {application?.admin_note && (
            <p className="mt-2 rounded-2xl bg-white border border-red-200 p-4 text-xs font-mono text-slate-700 max-w-md mx-auto">
              <span className="font-bold text-red-900">Admin Note:</span> {application.admin_note}
            </p>
          )}
          <Button
            variant="outline"
            className="mt-4 rounded-full border-red-300 text-red-900 hover:bg-red-600 hover:text-white font-mono text-xs font-bold uppercase tracking-wider px-8 py-3"
            onClick={() => void supabase.auth.signOut().then(() => navigate({ to: "/login" }))}
          >
            Sign Out
          </Button>
        </section>
      ) : status === "approved" ? (
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 p-8 sm:p-10 text-center text-white shadow-2xl space-y-4">
          <LogoWatermark className="opacity-[0.05] text-white" />
          <CheckCircle2 className="relative mx-auto size-12 text-emerald-400" />
          <h1 className="relative text-3xl font-black uppercase tracking-tight">APPLICATION APPROVED!</h1>
          <p className="relative text-sm text-slate-300 font-mono">
            Welcome to the PREDICTA Partner Network — launching your dashboard…
          </p>
        </section>
      ) : status === "pending" ? (
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/80 p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <LogoSymbol className="pointer-events-none absolute -right-6 -bottom-8 h-44 w-auto opacity-[0.04] text-amber-950" aria-hidden />

          <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 border border-amber-200 shadow-2xs text-amber-700">
            <Loader2 className="size-8 animate-spin" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-200 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900">
              REAL-TIME APPROVAL QUEUE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-amber-950">
              APPLICATION UNDER REVIEW
            </h1>
            <p className="text-xs text-amber-800 leading-relaxed font-normal">
              Your partner application is logged and pending admin verification. Access unlocks automatically upon approval — no need to refresh.
            </p>
          </div>

          <div className="relative max-w-md mx-auto space-y-3 rounded-2xl border border-amber-200 bg-white p-5 text-left font-mono">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-900">
              APPROVAL PROGRESSION
            </p>
            <div className="space-y-2.5">
              {[
                { done: true, label: "Account created & fee waived" },
                { done: true, label: "Application submitted to queue" },
                { done: false, label: "Admin approves application" },
                { done: false, label: "Partner hub unlocked" },
              ].map(({ done, label }, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      done ? "bg-slate-950 text-white" : "bg-amber-100 text-amber-800 border border-amber-300",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={cn(
                      done ? "text-slate-400 line-through" : "text-slate-900 font-bold",
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <LogoSymbol className="pointer-events-none absolute -right-6 -bottom-10 h-44 w-auto opacity-[0.04] text-slate-950" aria-hidden />

          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-red-600">
              <Handshake className="size-3.5" /> AFFILIATE ONBOARDING
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-950">
              APPLY FOR PREDICTA PARTNERSHIP
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              No registration fee required. Earn ongoing commission for every member you refer to PREDICTA.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <div className="space-y-2">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Your Audience & Platform
              </Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. 5,000 members in Telegram virtual tips group"
                className="h-12 rounded-xl border-slate-200 focus:border-red-600 focus:ring-red-600/20 text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Promotion Plan & Strategy
              </Label>
              <Textarea
                id="motivation"
                rows={4}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Describe how you plan to introduce PREDICTA to your audience"
                className="rounded-xl border-slate-200 focus:border-red-600 focus:ring-red-600/20 text-sm font-medium"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Preferred Payout Method
                </Label>
                <Input
                  id="payout-method"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 focus:border-red-600 focus:ring-red-600/20 text-sm font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Payout Mobile Money Number
                </Label>
                <Input
                  id="payout-details"
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder="e.g. 059 000 0000"
                  className="h-12 rounded-xl border-slate-200 focus:border-red-600 focus:ring-red-600/20 text-sm font-mono font-bold"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submit.isPending || isLoading}
              className="w-full rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold uppercase tracking-wider text-xs py-4 shadow-lg shadow-red-600/25 transition-all border-0 cursor-pointer"
            >
              {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Partner Application
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}

