import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Coins, ScanSearch, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/AppShell";
import { LogoSymbol, LogoWatermark } from "@/components/brand/Logo";
import { analysesQuery, profileQuery, referralsQuery, rolesQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PREDICTA" },
      { name: "description", content: "Your PREDICTA workspace: credit balance, recent screenshot analyses and insight reports." },
      { property: "og:title", content: "Dashboard — PREDICTA" },
      { property: "og:description", content: "Track credits and AI insight reports in your PREDICTA workspace." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery(profileQuery(user.id));
  const { data: analyses } = useQuery(analysesQuery(user.id));
  const { data: roles } = useQuery(rolesQuery(user.id));
  const isPartner = (roles ?? []).includes("partner");
  const { data: referrals } = useQuery({ ...referralsQuery(user.id), enabled: isPartner });

  const completed = (analyses ?? []).filter((a) => a.status === "completed").length;
  const recent = (analyses ?? []).slice(0, 5);

  const stats = [
    { label: "CREDITS AVAILABLE", value: profile?.credits ?? 0, icon: Coins, hint: "Match scan capacity" },
    { label: "PREDICTIONS RUN", value: analyses?.length ?? 0, icon: ScanSearch, hint: "Total screenshots processed" },
    { label: "VERDICTS DELIVERED", value: completed, icon: Sparkles, hint: "Successful AI outcomes" },
    ...(isPartner
      ? [{ label: "MEMBERS REFERRED", value: referrals ?? 0, icon: Users, hint: "Affiliate network users" }]
      : []),
  ];

  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : null;

  return (
    <div className="space-y-10 selection:bg-red-600 selection:text-white pb-12">
      {/* Editorial Header */}
      <PageHeader
        badgeText="PREDICTA COMMAND CENTER"
        title={`WELCOME BACK${firstName ? `, ${firstName}` : ""}.`}
        description="Upload an instant virtual football screenshot to expose seed packets and receive 99.8% accurate outcomes."
      />

      {/* 4 Apple-Style Stat Cards Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest truncate">
                  {s.label}
                </span>
                <div className="size-8 sm:size-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <s.icon className="size-4" />
                </div>
              </div>
              <p className="mt-4 sm:mt-5 text-3xl sm:text-5xl font-black tracking-tight text-slate-950 font-sans">
                {s.value}
              </p>
            </div>
            <p className="mt-4 text-xs font-mono text-slate-400 border-t border-slate-100 pt-3">
              {s.hint}
            </p>
          </div>
        ))}
      </div>

      {/* Obsidian Quick-Action Hero Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 text-white p-6 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        {/* Ambient Red Blur Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-red-600/20 blur-[110px]" />
        <LogoWatermark className="opacity-[0.06] text-white" />
        <LogoSymbol className="pointer-events-none absolute right-8 top-8 h-10 w-auto opacity-20 text-white" aria-hidden />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-200">
            <Zap className="size-3.5 text-red-500" /> INSTANT SEED DECODER
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
            READY FOR YOUR NEXT MATCH VERDICT?
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Each scan costs 1 credit. Drop in your instant/virtual football screenshot and PREDICTA's seed decoder will compute high-probability outcomes before public match graphics complete rendering.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-white hover:text-slate-950 text-white rounded-full px-8 py-3.5 font-bold uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 hover:scale-[1.02] transition-all border-0 cursor-pointer"
            >
              <Link to="/analyze" className="flex items-center gap-2">
                Start Match Scan
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-slate-700 hover:border-white text-slate-300 hover:text-white px-7 py-3 font-semibold uppercase tracking-wider text-xs bg-slate-900/60 transition-all cursor-pointer"
            >
              <Link to="/credits">Top Up Credits</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Verdicts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
              DECODED AUDIT TRAIL
            </span>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
              RECENT VERDICTS
            </h2>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-red-600 hover:text-slate-950 transition-colors"
          >
            View Full History <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {recent.length === 0 && (
            <div className="p-10 text-center space-y-3">
              <Trophy className="mx-auto size-10 text-slate-300" />
              <p className="text-base font-bold text-slate-950 uppercase">No match scans recorded yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
                Upload your first instant virtual football screenshot to generate 99.8% accurate outcomes.
              </p>
              <Button
                asChild
                className="mt-2 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 shadow-md shadow-red-600/20"
              >
                <Link to="/analyze">Run First Analysis</Link>
              </Button>
            </div>
          )}
          {recent.map((a) => (
            <Link
              key={a.id}
              to="/analysis/$id"
              params={{ id: a.id }}
              className="flex items-center justify-between gap-4 p-5 sm:p-6 transition-all hover:bg-slate-50/80 group"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-base font-extrabold text-slate-950 group-hover:text-red-600 transition-colors">
                  {a.title}
                </p>
                <p className="text-xs font-mono text-slate-400">
                  {new Date(a.created_at).toLocaleString()} · {a.credits_used ?? 1} credit
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs border-0",
                    a.status === "completed"
                      ? "bg-slate-950 text-white"
                      : a.status === "failed"
                        ? "bg-red-600 text-white"
                        : "bg-amber-500 text-white"
                  )}
                >
                  {a.status}
                </Badge>
                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-red-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

