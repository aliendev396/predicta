import { useEffect, useState } from "react";
import { LogoFull } from "@/components/brand/Logo";

// Module-level guard so page-to-page transitions in the same session are instant
let hasShownSplashInSession = false;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      if (hasShownSplashInSession || sessionStorage.getItem("predicta-splash") === "1") {
        return false;
      }
    }
    return true;
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (hasShownSplashInSession || sessionStorage.getItem("predicta-splash") === "1")) {
      setVisible(false);
      return;
    }

    // Fast, responsive splash timing: 240ms display -> 180ms smooth fadeout (total ~420ms)
    const fadeTimer = setTimeout(() => setFading(true), 240);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      hasShownSplashInSession = true;
      try {
        sessionStorage.setItem("predicta-splash", "1");
      } catch {
        // Ignore storage quota/private browsing exceptions
      }
    }, 420);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-200 ease-out ${
        fading ? "opacity-0 pointer-events-none scale-[1.02]" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4">
        {/* Brand Logo & Version Tag */}
        <div className="flex items-center gap-2.5 animate-fade-in">
          <LogoFull variant="dark" className="h-8 sm:h-9 w-auto object-contain" />
          <span className="text-[10px] font-mono font-semibold tracking-widest text-red-600 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full uppercase">
            v4.2 PRO
          </span>
        </div>

        {/* High-Tech Fast Progress Line */}
        <div className="relative h-[2px] w-36 overflow-hidden rounded-full bg-slate-100 mt-1">
          <div className="h-full bg-gradient-to-r from-red-600 to-red-500 animate-[splash-load_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards]" />
        </div>

        {/* Status Micro-text */}
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
          INITIALIZING VISION ENGINE
        </span>
      </div>
    </div>
  );
}