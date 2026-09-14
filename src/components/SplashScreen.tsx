import { useEffect, useRef, useState, useCallback } from "react";

// Module-level guard: survives HMR and client-side navigation
let hasShownSplashInSession = false;

function markSplashComplete() {
  hasShownSplashInSession = true;
  try {
    localStorage.setItem("predicta-splash", "1");
  } catch {
    // Ignore storage exceptions
  }
}

function shouldSkipSplash(): boolean {
  if (hasShownSplashInSession) return true;
  try {
    return localStorage.getItem("predicta-splash") === "1";
  } catch {
    return false;
  }
}

export function SplashScreen() {
  // SSR: render nothing. Only mount on client after hydration.
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("gone");
  const overlayRef = useRef<HTMLDivElement>(null);

  const forceRemove = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.style.display = "none";
    }
    setPhase("gone");
    markSplashComplete();
  }, []);

  // Step 1: After hydration, decide whether to show the splash
  useEffect(() => {
    if (shouldSkipSplash()) {
      markSplashComplete();
      return; // phase stays "gone", nothing renders
    }
    // Show the splash
    setPhase("visible");
    setMounted(true);
  }, []);

  // Step 2: Once visible, schedule fade-out and safety timeout
  useEffect(() => {
    if (phase !== "visible") return;

    const fadeTimer = setTimeout(() => setPhase("fading"), 1200);
    const safetyTimer = setTimeout(forceRemove, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(safetyTimer);
    };
  }, [phase, forceRemove]);

  const handleTransitionEnd = useCallback(() => {
    if (phase === "fading") forceRemove();
  }, [phase, forceRemove]);

  const handleDismiss = useCallback(() => {
    if (phase === "visible") {
      setPhase("fading");
      setTimeout(forceRemove, 400);
    }
  }, [phase, forceRemove]);

  // Don't render anything during SSR or if splash is done
  if (!mounted || phase === "gone") return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      onClick={handleDismiss}
      onTransitionEnd={handleTransitionEnd}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-300 ease-out cursor-pointer ${
        phase === "fading"
          ? "opacity-0 pointer-events-none scale-[1.02]"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background Radial Shimmer Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[340px] h-[340px] rounded-full bg-red-600/10 blur-[100px] animate-[pulse-wave_4s_ease-out_infinite]" />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        {/* PREDICTA Wordmark with Shimmer Wave Sheen */}
        <div className="relative overflow-hidden px-4 py-2 rounded-xl">
          <img
            src="/predicta-wordmark.png"
            alt="PREDICTA"
            className="h-8 sm:h-10 w-auto object-contain select-none"
            loading="eager"
            decoding="sync"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer-wave_4s_cubic-bezier(0.4,0,0.2,1)_infinite] bg-gradient-to-r from-transparent via-white/85 via-red-400/20 to-transparent"
          />
        </div>

        {/* Shimmer Wave Accent Track */}
        <div className="relative h-[2px] w-40 overflow-hidden rounded-full bg-slate-100 mt-1">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-[shimmer-wave_4s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
        </div>

        {/* Micro-Telemetry Tag */}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_#e41827] animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase font-semibold">
            AI VISION ENGINE
          </span>
        </div>
      </div>
    </div>
  );
}