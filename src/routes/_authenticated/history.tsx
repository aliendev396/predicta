import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, History, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { analysesQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — PREDICTA" },
      { name: "description", content: "Browse every screenshot analysis and AI insight report in your PREDICTA workspace." },
      { property: "og:title", content: "Analysis History — PREDICTA" },
      { property: "og:description", content: "All of your PREDICTA insight reports in one place." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = Route.useRouteContext();
  const { data: analyses, isLoading } = useQuery(analysesQuery(user.id));

  return (
    <div className="space-y-10 selection:bg-red-600 selection:text-white pb-12">
      {/* Top Bar with Page Header & Action Pill */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <PageHeader
          badgeText="PREDICTA LOGS"
          title="DECODED AUDIT TRAIL."
          description="Every match screenshot report decoded by your PREDICTA engine, newest first."
        />
        <Button
          asChild
          className="mb-2 shrink-0 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 shadow-md shadow-red-600/20 transition-all border-0 cursor-pointer"
        >
          <Link to="/analyze" className="flex items-center gap-2">
            <Plus className="size-4" /> New Match Scan
          </Link>
        </Button>
      </div>

      {/* History Items Container */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="p-12 text-center space-y-3 font-mono text-slate-500">
            <Sparkles className="mx-auto size-8 text-red-600 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider">Fetching prediction audit trail…</p>
          </div>
        )}

        {!isLoading && (analyses ?? []).length === 0 && (
          <div className="p-12 text-center space-y-3">
            <History className="mx-auto size-10 text-slate-300" />
            <p className="text-base font-extrabold uppercase tracking-tight text-slate-950">
              No decoded match scans in history
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto font-normal">
              Upload your first instant virtual football screenshot to record decoded match verdicts.
            </p>
            <Button
              asChild
              className="mt-2 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 shadow-md shadow-red-600/20"
            >
              <Link to="/analyze">Run First Match Scan</Link>
            </Button>
          </div>
        )}

        {(analyses ?? []).map((a) => (
          <Link
            key={a.id}
            to="/analysis/$id"
            params={{ id: a.id }}
            className="flex items-center justify-between gap-4 p-6 transition-all hover:bg-slate-50/80 group"
          >
            <div className="min-w-0 space-y-1.5">
              <p className="truncate text-base font-extrabold text-slate-950 group-hover:text-red-600 transition-colors">
                {a.title}
              </p>
              {a.summary && (
                <p className="line-clamp-2 text-xs text-slate-600 font-normal leading-relaxed">{a.summary}</p>
              )}
              <p className="text-xs font-mono text-slate-400">
                {new Date(a.created_at).toLocaleString()} · {a.credits_used ?? 1} scan credit
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
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
    </div>
  );
}

