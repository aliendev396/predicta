import { useState } from "react";
import { Zap } from "lucide-react";

interface OutcomeItem {
  id: string;
  game: string;
  prediction: string;
  confidence: number;
  time: string;
  status: "VERIFIED" | "LIVE";
}

const INITIAL_MOCK_DATA: OutcomeItem[] = [
  { id: "1", game: "V-LEAGUE · ARS vs CHE", prediction: "HOME WIN (3-1)", confidence: 98.4, time: "0.2s ago", status: "VERIFIED" },
  { id: "2", game: "INSTANT CUP · RMD vs BAR", prediction: "OVER 2.5 GOALS", confidence: 99.1, time: "1.1s ago", status: "VERIFIED" },
  { id: "3", game: "V-TURBO · MUN vs LIV", prediction: "BOTH SCORE - YES", confidence: 97.8, time: "2.4s ago", status: "VERIFIED" },
  { id: "4", game: "V-LEAGUE · MCI vs TOT", prediction: "HOME OVER 1.5", confidence: 98.9, time: "3.0s ago", status: "VERIFIED" },
];

export function LiveTicker() {
  const [items] = useState<OutcomeItem[]>(INITIAL_MOCK_DATA);

  return (
    <div className="w-full bg-slate-900/95 text-white border-y border-red-900/30 overflow-hidden py-3 text-xs font-mono select-none backdrop-blur-md relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5 pointer-events-none" />
      <div className="flex items-center gap-4 sm:gap-8 animate-marquee whitespace-nowrap relative z-10">
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60 shadow-sm text-xs shrink-0 hover:border-red-500/50 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#e41827]" />
              {item.status}
            </span>
            <span className="text-slate-200 font-sans text-[11px] sm:text-xs font-semibold">{item.game}</span>
            <span className="text-white font-mono font-bold tracking-tight">{item.prediction}</span>
            <span className="text-emerald-400 text-[10px] font-mono font-bold bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              {item.confidence}% ACCURACY
            </span>
            <span className="text-slate-400 text-[9px] sm:text-[10px] font-medium">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
