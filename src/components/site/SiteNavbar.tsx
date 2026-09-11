import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { LogoFull } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Overview", href: "#overview" },
  { label: "Neural Engine", href: "#engine" },
  { label: "Bento Specs", href: "#specs" },
  { label: "Workflow", href: "#workflow" },
  { label: "Packages", href: "#packages" },
  { label: "FAQ", href: "#faq" },
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#060608]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-[#060608]/60 backdrop-blur-xl border-b border-white/[0.05]"
      }`}
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Apple-styled PREDICTA Brand Logo */}
        <Link to="/" aria-label="PREDICTA home" className="flex items-center gap-2.5 group shrink-0">
          <LogoFull className="h-6.5 sm:h-7.5 w-auto object-contain transition-opacity group-hover:opacity-85" />
          <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tracking-wide text-neutral-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            v2.4
          </span>
        </Link>

        {/* Desktop nav — Apple minimalist links */}
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-normal tracking-tight text-neutral-400 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA — Apple Pill buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#2997FF] hover:bg-[#0077ED] text-white text-xs font-semibold px-4.5 py-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold px-4.5 py-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile & Tablet CTA */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          {!loading && !isAuthenticated && (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-neutral-300 hover:text-white px-2 py-1"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-white text-black text-[11px] font-semibold px-3 py-1.5"
              >
                Join
              </Link>
            </>
          )}
          {!loading && isAuthenticated && (
            <Link
              to="/dashboard"
              className="rounded-full bg-[#2997FF] text-white text-[11px] font-semibold px-3 py-1.5"
            >
              Dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors ml-1 touch-manipulation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* ── Apple-styled Mobile Cupertino Drawer ── */}
      {open && (
        <div
          className="md:hidden border-t border-white/[0.08] bg-[#060608]/95 backdrop-blur-3xl"
          style={{
            boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
          }}
        >
          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="px-5 pt-4 pb-2">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                style={{
                  borderBottom: i < links.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                {l.label}
                <ChevronRight className="size-4 text-neutral-500" />
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-5 my-2 border-t border-white/[0.08]" />

          {/* CTA buttons */}
          <div className="px-5 pb-6 pt-2 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full py-2.5 text-xs font-semibold tracking-wide text-white bg-[#2997FF] hover:bg-[#0077ED] transition-all"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full py-2.5 text-xs font-semibold tracking-wide text-black bg-white hover:bg-neutral-200 transition-all shadow-md"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full py-2.5 text-xs font-medium tracking-wide text-neutral-300 border border-white/10 hover:bg-white/[0.06] transition-all"
                >
                  Log In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}