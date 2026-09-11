import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronRight, Zap, ArrowRight } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: "#FFFFFF",
        borderBottom: scrolled ? "1px solid #E8EDF3" : "1px solid transparent",
        boxShadow: scrolled
          ? "0 1px 0 #E8EDF3, 0 4px 24px rgba(15,23,42,0.06)"
          : "none",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <Link
          to="/"
          aria-label="PREDICTA home"
          className="flex items-center gap-2 shrink-0 group"
        >
          <LogoFull
            variant="dark"
            className="h-8 w-auto transition-opacity group-hover:opacity-80"
          />
        </Link>

        {/* ── Desktop nav links ── */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-3.5 py-2 text-sm font-medium text-slate-600 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50 group"
            >
              {l.label}
              <span className="absolute bottom-1.5 left-3.5 right-3.5 h-[1.5px] rounded-full bg-red-600 scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        {/* ── Desktop CTAs ── */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {loading ? null : isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #E41827 0%, #B00D1A 100%)",
                  boxShadow: "0 4px 14px rgba(228,24,39,0.30)",
                }}
              >
                <Zap className="size-3.5" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile controls ── */}
        <div className="flex items-center gap-2 lg:hidden">
          {!loading && !isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", boxShadow: "0 2px 10px rgba(228,24,39,0.25)" }}
            >
              <Zap className="size-3" />
              JOIN
            </Link>
          )}
          {!loading && isAuthenticated && (
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white"
            >
              Dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          className="lg:hidden border-t border-slate-100 bg-white animate-nav-reveal"
          style={{ boxShadow: "0 8px 32px rgba(15,23,42,0.10)" }}
        >
          <nav className="px-4 py-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3.5 text-sm font-medium text-slate-700 hover:text-red-600 border-b border-slate-50 last:border-0 transition-colors"
              >
                {l.label}
                <ChevronRight className="size-4 text-slate-300" />
              </a>
            ))}
          </nav>

          <div className="px-4 py-4 space-y-2.5 border-t border-slate-100">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white bg-emerald-600"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", boxShadow: "0 4px 14px rgba(228,24,39,0.25)" }}
                >
                  <Zap className="size-4" />
                  Get Started — Free Account
                </Link>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-xl py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          {/* Status strip */}
          <div className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-mono font-semibold tracking-widest text-slate-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM ONLINE · SECURE
          </div>
        </div>
      )}
    </header>
  );
}
