import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Check, Copy, Handshake, Link2, TrendingUp, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/AppShell";
import { LogoSymbol, LogoWatermark } from "@/components/brand/Logo";
import { commissionsQuery, ghs, partnerPayoutsQuery, partnerStatsQuery, profileQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/partner")({
  head: () => ({
    meta: [
      { title: "Partner Hub — PREDICTA" },
      {
        name: "description",
        content:
          "Track registrations from your PREDICTA referral code, revenue from your members and commissions earned.",
      },
      { property: "og:title", content: "Partner Hub — PREDICTA" },
      { property: "og:description", content: "Your PREDICTA referral performance at a glance." },
    ],
  }),
  component: PartnerPage,
});

function PartnerPage() {
  const { user } = Route.useRouteContext();
  const [copied, setCopied] = useState(false);
  const { data: profile } = useQuery(profileQuery(user.id));
  const { data: stats } = useQuery({ ...partnerStatsQuery(user.id), staleTime: 30_000, refetchOnWindowFocus: true });
  const { data: commissions } = useQuery(commissionsQuery(user.id));
  const { data: payouts } = useQuery(partnerPayoutsQuery(user.id));

  const referralLink =
    typeof window !== "undefined" && profile?.referral_code
      ? `${window.location.origin}/register?ref=${profile.referral_code}`
      : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // Fallback for mobile browsers without Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = referralLink;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Could not copy — long-press the link to copy manually.");
    }
  };

  return (
    <div className="space-y-10 selection:bg-red-600 selection:text-white pb-12">
      <PageHeader
        badgeText="AFFILIATE NETWORK"
        title="PARTNER HUB."
        description="Monitor member signups, commission yields, and lifetime referral earnings in real time."
      />

      {/* Hero Obsidian Payout Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 text-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-red-600/20 blur-[100px]" />
        <LogoWatermark className="opacity-[0.06] text-white" />
        <LogoSymbol
          className="pointer-events-none absolute right-8 top-8 h-8 w-auto text-white opacity-25"
          aria-hidden
        />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-slate-200">
              <Handshake className="size-3.5 text-red-500" /> VERIFIED PREDICTA PARTNER
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">PENDING PAYOUT BALANCE</p>
            <p className="text-5xl sm:text-6xl font-black leading-none tracking-tight font-sans text-white">
              {ghs(stats?.commissions_ghs ?? 0)}
            </p>
            <p className="text-xs font-mono text-slate-400 pt-1">
              Yielding {stats?.commission_rate ?? 10}% commission on every approved member package top-up.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/10 p-5 backdrop-blur-md space-y-3">
            <p className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-200">
              <Link2 className="size-4 text-red-400" /> YOUR UNIQUE REFERRAL LINK
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                readOnly
                value={referralLink}
                aria-label="Referral link"
                className="h-12 border-white/20 bg-slate-900/80 text-white font-mono text-xs placeholder:text-slate-500 rounded-xl focus:ring-0"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className="h-12 min-w-[120px] rounded-xl bg-red-600 hover:bg-white hover:text-slate-950 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md shadow-red-600/20 transition-all cursor-pointer border-0"
              >
                {copied ? (
                  <span className="flex items-center gap-1.5 font-bold">
                    <Check className="size-4" /> Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Copy className="size-4" /> Copy Link
                  </span>
                )}
              </Button>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Referral Code: <span className="font-bold text-red-400">{profile?.referral_code}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3 Stat Cards Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Stat
          label="REGISTRATIONS"
          value={String(stats?.registrations ?? 0)}
          hint="Members who joined using your link"
          icon={<Users className="size-4" />}
        />
        <Stat
          label="LIFETIME MEMBER REVENUE"
          value={ghs(stats?.lifetime_revenue_ghs ?? stats?.revenue_ghs ?? 0)}
          hint="All-time approved package volume"
          icon={<TrendingUp className="size-4" />}
        />
        <Stat
          label="LIFETIME COMMISSIONS"
          value={ghs(stats?.lifetime_commissions_ghs ?? stats?.commissions_ghs ?? 0)}
          hint="Total cleared affiliate earnings"
          icon={<Wallet className="size-4" />}
        />
      </div>

      {/* Commission History */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
            AFFILIATE YIELDS
          </span>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
            COMMISSION HISTORY
          </h2>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {(commissions ?? []).length === 0 && (
            <p className="p-8 text-center text-sm font-mono text-slate-400">
              No commissions yet. Yields log automatically when referred members top up credits.
            </p>
          )}
          {(commissions ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0 space-y-0.5">
                <p className="text-base font-black text-slate-950 font-sans">{ghs(c.amount_ghs)}</p>
                <p className="text-xs font-mono text-slate-400">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-950 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3.5 py-1">
                Earned
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Payout History */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
            PAYOUT LEDGER
          </span>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
            PAYOUT HISTORY
          </h2>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {(payouts ?? []).length === 0 && (
            <p className="p-8 text-center text-sm font-mono text-slate-400">
              No payouts recorded yet. Cleared balances from admin appear here.
            </p>
          )}
          {(payouts ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0 space-y-0.5">
                <p className="text-base font-black text-slate-950 font-sans">{ghs(p.amount_ghs)}</p>
                <p className="text-xs font-mono text-slate-400">
                  {new Date(p.cleared_at).toLocaleString()}
                </p>
                {p.note && (
                  <p className="mt-1 text-xs text-slate-600 italic">"{p.note}"</p>
                )}
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold uppercase tracking-widest px-3.5 py-1">
                <Banknote className="size-3.5 text-emerald-600" />
                PAID OUT
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </span>
          <div className="size-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            {icon}
          </div>
        </div>
        <p className="mt-5 text-4xl font-black tracking-tight text-slate-950 font-sans">{value}</p>
      </div>
      <p className="mt-4 text-xs font-mono text-slate-400 border-t border-slate-100 pt-3">{hint}</p>
    </div>
  );
}

