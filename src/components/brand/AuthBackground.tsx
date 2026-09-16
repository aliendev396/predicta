import { ReactNode } from "react";
import { LogoFull } from "@/components/brand/Logo";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Cpu, Activity } from "lucide-react";

interface AuthBackgroundProps {
  children: ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans selection:bg-red-600 selection:text-white">
      {/* Left Editorial / Institutional Panel (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950 text-white relative flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-slate-800">
        {/* Ambient Red & Cyan Mesh Glows */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-red-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-[320px] h-[320px] bg-slate-800/30 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Header / Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <LogoFull variant="white" className="h-8 w-auto text-white transition-transform group-hover:scale-[1.02]" />
            <span className="text-[10px] font-mono font-semibold tracking-widest text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded-full uppercase">
              v4.2 PRO
            </span>
          </Link>
        </div>

        {/* Middle Editorial Content */}
        <div className="relative z-10 space-y-7 max-w-lg my-auto py-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold tracking-widest text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#e41827]" />
            <span>AI VISION ENGINE · V4.2 LIVE</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white uppercase">
            REAL-TIME VISION ANALYTICS FOR INSTANT VIRTUALS.
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            Ingest match screenshots, reconstruct statistical probabilities, and receive high-confidence outcome recommendations before graphics finish rendering.
          </p>

          {/* Feature Micro-Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
              <div className="p-2 rounded-lg bg-red-950/80 border border-red-800/60 text-red-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white uppercase tracking-wider">Vision OCR Parsing</div>
                <div className="text-slate-400 text-[11px]">Millisecond optical fixture and team odds extraction</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white uppercase tracking-wider">Neural Matrix Engine</div>
                <div className="text-slate-400 text-[11px]">99.8% backtested accuracy across major instant leagues</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-mono font-extrabold text-red-500">99.8%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Prediction Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-extrabold text-white">0.04s</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Pipeline Latency</div>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-6">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-BIT ENCRYPTED WORKSPACE</span>
          </div>
          <span className="font-mono text-[11px]">© PREDICTA</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16 min-w-0 bg-slate-50/60 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Centered Brand Logo */}
        <div className="flex justify-center items-center relative z-10 mb-4 sm:mb-6">
          <Link to="/" className="flex items-center gap-2 group" aria-label="PREDICTA Home">
            <LogoFull variant="dark" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]" />
            <span className="text-[10px] font-mono font-semibold tracking-widest text-red-600 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full uppercase">
              v4.2 PRO
            </span>
          </Link>
        </div>

        {/* Form Card Container */}
        <div className="my-auto py-2 sm:py-6 max-w-md w-full mx-auto relative z-10">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.06)] border-t-2 border-t-red-600 p-6 sm:p-9">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
