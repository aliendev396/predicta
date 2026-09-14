import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldAlert, Sparkles, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/AppShell";
import { LogoSymbol, LogoWatermark } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { analysisQuery } from "@/lib/data";
import type { AnalysisResult } from "@/lib/analysis-prompt";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analysis/$id")({
  head: () => ({
    meta: [
      { title: "Prediction Verdict — PREDICTA" },
      { name: "description", content: "PREDICTA's confident football prediction verdict extracted from your screenshot." },
      { property: "og:title", content: "Prediction Verdict — PREDICTA" },
      { property: "og:description", content: "The most likely match outcomes, picked with confidence by PREDICTA." },
    ],
  }),
  component: AnalysisDetailPage,
});

function AnalysisDetailPage() {
  const { id } = Route.useParams();
  const { data: analysis, isLoading } = useQuery(analysisQuery(id));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!analysis?.image_path) return;
    let active = true;
    void supabase.storage
      .from("screenshots")
      .createSignedUrl(analysis.image_path, 600)
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data?.signedUrl) {
          setImageError(true);
        } else {
          setImageUrl(data.signedUrl);
        }
      })
      .catch(() => {
        if (active) setImageError(true);
      });
    return () => {
      active = false;
    };
  }, [analysis?.image_path]);

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3 font-mono">
        <Sparkles className="mx-auto size-8 text-red-600 animate-spin" />
        <p className="text-sm font-bold uppercase tracking-wider text-slate-700">Loading decoded verdict…</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <PageHeader
          badgeText="SYSTEM NOTICE"
          title="VERDICT NOT FOUND"
          description="This match scan record doesn't exist or was removed."
        />
        <Button asChild className="rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold uppercase tracking-wider text-xs px-6 py-3">
          <Link to="/history">
            <ArrowLeft className="mr-2 size-4" /> Back to History
          </Link>
        </Button>
      </div>
    );
  }

  const result = (analysis.result ?? null) as AnalysisResult | null;
  const matches = result?.matches ?? [];
  const irrelevant = result?.relevant === false;

  return (
    <div className="space-y-8 selection:bg-red-600 selection:text-white pb-12">
      {/* Top Back Navigation Link */}
      <div>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Decoded Audit Trail
        </Link>
      </div>

      {/* Main Title & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-[10px] font-bold tracking-widest uppercase">
            <Zap className="size-3" /> MATCH TELEMETRY DECODED
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight break-words">
            {analysis.title}
          </h1>
          <p className="text-xs font-mono text-slate-400">
            {new Date(analysis.created_at).toLocaleString()}
            {typeof result?.confidence === "number"
              ? ` · ${Math.round(result.confidence * 100)}% ALGORITHMIC CONFIDENCE`
              : ""}
          </p>
        </div>

        <Badge
          className={cn(
            "font-mono text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xs border-0",
            analysis.status === "completed"
              ? "bg-slate-950 text-white"
              : analysis.status === "failed"
                ? "bg-red-600 text-white"
                : "bg-amber-500 text-white"
          )}
        >
          {analysis.status}
        </Badge>
      </div>

      {/* Irrelevant Screenshot Alert */}
      {irrelevant && (
        <div className="animate-verdict flex gap-4 rounded-3xl border-2 border-red-200 bg-red-50 p-6 text-red-900">
          <ShieldAlert className="mt-0.5 size-6 shrink-0 text-red-600" />
          <div className="space-y-1">
            <p className="text-base font-extrabold uppercase tracking-tight">
              CREDIT CONSUMED — NON-FOOTBALL SCREENSHOT
            </p>
            <p className="text-xs leading-relaxed text-red-700">
              {analysis.error_message ?? result?.reason ?? "This screenshot does not contain recognizable instant virtual football match seeds."}
            </p>
          </div>
        </div>
      )}

      {/* Error Message if present */}
      {!irrelevant && analysis.error_message && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-xs font-mono text-red-700">
          {analysis.error_message}
        </div>
      )}

      {/* Headline Verdict Card (Obsidian Gradient Hero) */}
      {!irrelevant && result?.headline && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 text-white p-8 sm:p-10 shadow-2xl space-y-3">
          <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-red-600/20 blur-[100px]" />
          <LogoWatermark className="opacity-[0.05] text-white" />
          <LogoSymbol
            className="pointer-events-none absolute right-8 top-8 h-8 w-auto text-white opacity-25"
            aria-hidden
          />
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block">
              PREDICTA DECISIVE VERDICT
            </span>
            <p className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-snug">
              {result.headline}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Match Pick Cards & Source Screenshot */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Match Picks */}
        <div className="space-y-6">
          <h2 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            COMMITTED MATCH PICKS ({matches.length})
          </h2>

          {matches.map((m, i) => (
            <article
              key={i}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
            >
              <LogoSymbol
                className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-auto opacity-[0.03] text-slate-950"
                aria-hidden
              />
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">
                    {m.fixture}
                  </h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">
                    {[m.competition, m.kickoff].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {typeof m.confidence === "number" && (
                  <Badge className="bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border-0">
                    {Math.round(m.confidence * 100)}% SURE
                  </Badge>
                )}
              </div>

              <div className="relative z-10 flex items-center gap-3 sm:gap-4 rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 shadow-md min-w-0">
                <div className="size-9 sm:size-10 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Target className="size-4 sm:size-5" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-lg sm:text-xl font-black text-white font-sans uppercase tracking-tight break-words">{m.pick}</p>
                  <p className="text-xs font-mono text-slate-400 truncate">
                    {[m.market, m.odds ? `Odds ${m.odds}` : ""].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Source Screenshot Sidebar */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            SOURCE SCREENSHOT ATTACHMENT
          </h2>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={analysis.title}
                className="w-full rounded-2xl border border-slate-200 object-contain shadow-xs"
                onError={() => setImageError(true)}
              />
            ) : !analysis.image_path || imageError ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <p className="text-xs font-mono font-bold text-slate-600 uppercase">
                  SCREENSHOT IMAGE PURGED
                </p>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Source images are automatically purged after 7 days for storage efficiency. Your decoded prediction verdict above remains permanently saved.
                </p>
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-400 p-4 text-center">Loading image stream…</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

