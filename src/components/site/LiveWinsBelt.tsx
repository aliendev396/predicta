import { Trophy, TrendingUp, Sparkles } from "lucide-react";

interface LiveWin {
  id: string;
  phone: string;
  amountGhs: number;
  timeAgo: string;
  league: string;
}

const LIVE_WINS: LiveWin[] = [
  { id: "1", phone: "024••••••82", amountGhs: 3500, timeAgo: "1m ago", league: "V-LEAGUE" },
  { id: "2", phone: "055••••••41", amountGhs: 7200, timeAgo: "2m ago", league: "PREMIER VIRTUAL" },
  { id: "3", phone: "020••••••19", amountGhs: 1850, timeAgo: "3m ago", league: "SPANISH VIRTUAL" },
  { id: "4", phone: "059••••••93", amountGhs: 14200, timeAgo: "4m ago", league: "INSTANT CUP" },
  { id: "5", phone: "054••••••06", amountGhs: 4600, timeAgo: "6m ago", league: "V-LEAGUE" },
  { id: "6", phone: "027••••••72", amountGhs: 2850, timeAgo: "7m ago", league: "OVER 2.5 MATRIX" },
  { id: "7", phone: "050••••••35", amountGhs: 9400, timeAgo: "8m ago", league: "PREMIER VIRTUAL" },
  { id: "8", phone: "024••••••18", amountGhs: 5750, timeAgo: "9m ago", league: "V-LEAGUE" },
  { id: "9", phone: "055••••••64", amountGhs: 12900, timeAgo: "11m ago", league: "INSTANT MATCH" },
  { id: "10", phone: "053••••••27", amountGhs: 3100, timeAgo: "12m ago", league: "V-LEAGUE" },
  { id: "11", phone: "020••••••88", amountGhs: 6400, timeAgo: "14m ago", league: "SPANISH VIRTUAL" },
  { id: "12", phone: "059••••••51", amountGhs: 21500, timeAgo: "15m ago", league: "HIGH STAKE COMBO" },
  { id: "13", phone: "054••••••90", amountGhs: 8300, timeAgo: "17m ago", league: "PREMIER VIRTUAL" },
  { id: "14", phone: "024••••••33", amountGhs: 16800, timeAgo: "19m ago", league: "V-LEAGUE" },
  { id: "15", phone: "027••••••49", amountGhs: 3950, timeAgo: "21m ago", league: "INSTANT CUP" },
  { id: "16", phone: "055••••••12", amountGhs: 18750, timeAgo: "22m ago", league: "V-LEAGUE" },
  { id: "17", phone: "050••••••84", amountGhs: 4200, timeAgo: "24m ago", league: "OVER 2.5 MATRIX" },
  { id: "18", phone: "024••••••77", amountGhs: 11400, timeAgo: "26m ago", league: "PREMIER VIRTUAL" },
  { id: "19", phone: "053••••••05", amountGhs: 5350, timeAgo: "28m ago", league: "V-LEAGUE" },
  { id: "20", phone: "059••••••66", amountGhs: 27000, timeAgo: "30m ago", league: "PRO SCAN VERIFIED" },
];

export function LiveWinsBelt() {
  return (
    <div
      className="relative z-40 w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800/90 shadow-inner overflow-hidden select-none"
      aria-label="Live wins ticker"
    >
      <div className="flex items-center">
        {/* Pinned Left Badge */}
        <div className="shrink-0 flex items-center gap-2 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 border-r border-slate-800 z-20 shadow-[10px_0_20px_rgba(0,0,0,0.6)]">
          <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <div className="flex items-center gap-1.5">
            <Trophy className="size-3.5 text-amber-400" />
            <span className="font-mono text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-white whitespace-nowrap">
              LIVE WINS
            </span>
          </div>
          <span className="hidden md:inline-flex rounded-full bg-emerald-950 border border-emerald-800/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
            VERIFIED
          </span>
        </div>

        {/* Marquee Track Container with subtle fade masks */}
        <div className="relative flex-1 overflow-hidden group">
          {/* Subtle Left Gradient Mask */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-slate-950 to-transparent z-10" />

          {/* Seamless Infinite Gliding Marquee Track */}
          <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused] py-2.5 sm:py-3">
            {/* First sequence */}
            {LIVE_WINS.map((win) => (
              <div
                key={`win-1-${win.id}`}
                className="flex items-center gap-2.5 px-4 sm:px-6 whitespace-nowrap text-xs font-mono border-r border-slate-800/70"
              >
                <span className="text-slate-300 font-semibold tracking-wider">
                  {win.phone}
                </span>
                <span className="text-slate-400 text-[11px]">won</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md shadow-xs shadow-emerald-950/40">
                  <Sparkles className="size-3 text-emerald-400 shrink-0" />
                  GH₵ {win.amountGhs.toLocaleString("en-GH")}
                </span>
                <span className="text-[10px] text-amber-300/80 bg-amber-950/50 border border-amber-800/40 px-1.5 py-0.5 rounded text-opacity-90 font-bold uppercase tracking-wider hidden sm:inline-block">
                  {win.league}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  · {win.timeAgo}
                </span>
              </div>
            ))}

            {/* Second sequence for seamless infinite loop */}
            {LIVE_WINS.map((win) => (
              <div
                key={`win-2-${win.id}`}
                className="flex items-center gap-2.5 px-4 sm:px-6 whitespace-nowrap text-xs font-mono border-r border-slate-800/70"
              >
                <span className="text-slate-300 font-semibold tracking-wider">
                  {win.phone}
                </span>
                <span className="text-slate-400 text-[11px]">won</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md shadow-xs shadow-emerald-950/40">
                  <Sparkles className="size-3 text-emerald-400 shrink-0" />
                  GH₵ {win.amountGhs.toLocaleString("en-GH")}
                </span>
                <span className="text-[10px] text-amber-300/80 bg-amber-950/50 border border-amber-800/40 px-1.5 py-0.5 rounded text-opacity-90 font-bold uppercase tracking-wider hidden sm:inline-block">
                  {win.league}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  · {win.timeAgo}
                </span>
              </div>
            ))}
          </div>

          {/* Subtle Right Gradient Mask */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}
