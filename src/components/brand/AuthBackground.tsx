import { ReactNode } from "react";
import { LogoSymbol } from "@/components/brand/Logo";

export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: "#0A0208" }}
    >
      {/* Red ambient top glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(228,24,39,0.28) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      {/* Bottom green ambient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 10% 100%, rgba(16,185,129,0.07) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Animated dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] animate-grid-drift"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(228,24,39,0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Floating orbs */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 size-96 rounded-full blur-3xl opacity-20 animate-glow-pulse"
        style={{ background: "radial-gradient(circle, rgba(228,24,39,0.6), transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-28 size-80 rounded-full blur-3xl opacity-15 animate-glow-pulse"
        style={{ background: "radial-gradient(circle, rgba(228,24,39,0.4), transparent 70%)", animationDelay: "1.5s" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/3 size-72 rounded-full blur-3xl opacity-10 animate-glow-pulse"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.5), transparent 70%)", animationDelay: "3s" }}
        aria-hidden="true"
      />

      {/* Large watermark logos */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-80 w-80 opacity-[0.04] animate-logo-drift select-none"
        aria-hidden="true"
      >
        <LogoSymbol className="h-full w-full brightness-0 invert" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 opacity-[0.03] -rotate-12 select-none"
        aria-hidden="true"
      >
        <LogoSymbol className="h-full w-full brightness-0 invert" />
      </div>

      {/* Pulse rings */}
      <div
        className="pointer-events-none absolute top-1/3 left-[8%] size-52 rounded-full opacity-20 animate-pulse-ring"
        style={{ border: "1px solid rgba(228,24,39,0.35)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-[8%] size-64 rounded-full opacity-15 animate-pulse-ring"
        style={{ border: "1px solid rgba(228,24,39,0.25)", animationDelay: "1s" }}
        aria-hidden="true"
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[
          { top: "25%", left: "15%", delay: "0s", dur: "3s" },
          { top: "70%", left: "10%", delay: "1s", dur: "4.5s" },
          { top: "35%", right: "18%", delay: "0.5s", dur: "3.8s" },
          { top: "65%", right: "12%", delay: "2s", dur: "5s" },
          { top: "50%", left: "50%", delay: "1.5s", dur: "4s" },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute size-1.5 rounded-full blur-[1px] animate-ping"
            style={{
              top: p.top,
              left: (p as any).left,
              right: (p as any).right,
              background: i % 2 === 0 ? "rgba(228,24,39,0.7)" : "rgba(16,185,129,0.6)",
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-rise">
        {children}
      </div>
    </main>
  );
}
