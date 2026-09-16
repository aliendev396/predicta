import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LogoSymbol } from "@/components/brand/Logo";

interface LegalHeroBannerProps {
  badgeIcon: ReactNode;
  badgeText: string;
  lastUpdated?: string;
  title: string;
  description: string;
}

export function LegalHeroBanner({
  badgeIcon,
  badgeText,
  lastUpdated = "Last Updated: August 2026",
  title,
  description,
}: LegalHeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24 text-white border-b border-slate-800 shadow-2xl">
      {/* Ambient Red Glow Blur */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-red-600/15 blur-[120px]"
        aria-hidden="true"
      />

      {/* Decorative Logo Watermark */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-96 w-96 opacity-[0.06] select-none"
        aria-hidden="true"
      >
        <LogoSymbol className="h-full w-full text-white" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 mb-8 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to PREDICTA Home
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/15 border border-red-500/30 px-3.5 py-1 text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
            {badgeIcon}
            {badgeText}
          </span>
          <span className="text-xs text-slate-400 font-mono">{lastUpdated}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-sans break-words">
          {title}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </section>
  );
}

