import { ReactNode } from "react";
import { LogoSymbol } from "@/components/brand/Logo";

export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 bg-[#F8F9FB]">
      {/* Red ambient top glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 45% at 50% -8%, rgba(228,24,39,0.10) 0%, transparent 65%)" }}
        aria-hidden="true"
      />
      {/* Green bottom-left accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 35% at 5% 100%, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #E41827 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Large faint watermark logos */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 opacity-[0.035] animate-logo-drift select-none"
        aria-hidden="true"
      >
        <LogoSymbol className="h-full w-full" style={{ filter: "grayscale(1) opacity(0.4)" }} />
      </div>
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 opacity-[0.025] -rotate-12 select-none"
        aria-hidden="true"
      >
        <LogoSymbol className="h-full w-full" style={{ filter: "grayscale(1) opacity(0.4)" }} />
      </div>

      {/* Pulse rings */}
      <div
        className="pointer-events-none absolute top-1/3 left-[6%] size-48 rounded-full opacity-[0.12] animate-pulse-ring"
        style={{ border: "1.5px solid rgba(228,24,39,0.4)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-[6%] size-60 rounded-full opacity-[0.08] animate-pulse-ring"
        style={{ border: "1.5px solid rgba(228,24,39,0.3)", animationDelay: "1s" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-rise">
        {children}
      </div>
    </main>
  );
}
