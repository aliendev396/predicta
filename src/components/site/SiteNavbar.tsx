import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Terminal, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoFull, LogoSymbol } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Packages", href: "#packages" },
  { label: "FAQ", href: "#faq" },
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 transition-all"
      style={{
        background: "rgba(10, 2, 8, 0.88)",
        borderBottom: "1px solid rgba(228, 24, 39, 0.22)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow: "0 1px 0 rgba(228,24,39,0.12), 0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Red top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E41827 30%, #E41827 70%, transparent)" }}
      />

      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" aria-label="PREDICTA home" className="flex items-center gap-3 shrink-0 group">
          <div
            className="flex items-center rounded-lg px-2.5 py-1.5 transition-all duration-200 group-hover:scale-[1.03]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <LogoSymbol className="h-7 sm:h-8 object-contain" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest"
            style={{ border: "1px solid rgba(228,24,39,0.35)", background: "rgba(228,24,39,0.08)", color: "#f87171" }}
          >
            <span className="size-1.5 rounded-full bg-emerald-400 animate-status-blink" />
            LIVE
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[11px] font-semibold uppercase tracking-widest transition-colors"
              style={{ color: "rgba(240,240,240,0.65)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F0F0F0")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,240,240,0.65)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {loading ? null : isAuthenticated ? (
            <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide border border-emerald-500/50 shadow-lg shadow-emerald-900/30">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline"
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#D4D4D4" }}
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild
                className="h-9 px-5 text-xs font-bold tracking-wider text-white shadow-lg shadow-red-900/30"
                style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", border: "1px solid rgba(228,24,39,0.5)" }}
              >
                <Link to="/register">
                  <Zap className="size-3.5 mr-1.5" />
                  JOIN NOW
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {!loading && !isAuthenticated && (
            <>
              <Button asChild size="sm"
                className="h-8 text-xs font-bold px-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#D4D4D4" }}
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild size="sm"
                className="h-8 text-xs font-bold px-3 text-white"
                style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", border: "1px solid rgba(228,24,39,0.5)" }}
              >
                <Link to="/register">JOIN</Link>
              </Button>
            </>
          )}
          {!loading && isAuthenticated && (
            <Button asChild size="sm" className="h-8 bg-emerald-600 text-white font-bold text-xs px-3">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-md transition-colors ml-1 touch-manipulation"
            style={{ color: "#D4D4D4", background: open ? "rgba(228,24,39,0.12)" : "transparent" }}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden"
          style={{
            background: "rgba(12, 4, 10, 0.97)",
            borderTop: "1px solid rgba(228,24,39,0.18)",
            backdropFilter: "blur(20px)",
          }}
        >
          <nav aria-label="Mobile navigation" className="px-4 pt-2 pb-1">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3.5 text-sm font-semibold transition-colors"
                style={{
                  color: "rgba(240,240,240,0.75)",
                  borderBottom: i < links.length - 1 ? "1px solid rgba(228,24,39,0.10)" : "none",
                }}
              >
                {l.label}
                <ChevronRight className="size-4" style={{ color: "rgba(228,24,39,0.5)" }} />
              </a>
            ))}
          </nav>

          <div className="mx-4 my-2" style={{ height: "1px", background: "rgba(228,24,39,0.15)" }} />

          <div className="px-4 pb-5 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-lg py-3 text-sm font-bold tracking-wider text-white"
                style={{ background: "linear-gradient(135deg, #059669, #047857)", border: "1px solid #10b981" }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold tracking-wider text-white"
                  style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", border: "1px solid rgba(228,24,39,0.5)" }}
                >
                  <Zap className="size-4" />
                  JOIN NOW — FREE ACCOUNT
                </Link>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg py-3 text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#D4D4D4" }}
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          <div
            className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-mono font-bold tracking-widest"
            style={{ background: "rgba(228,24,39,0.06)", color: "rgba(240,240,240,0.4)", borderTop: "1px solid rgba(228,24,39,0.10)" }}
          >
            <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE · SECURE CONNECTION
          </div>
        </div>
      )}
    </header>
  );
}
