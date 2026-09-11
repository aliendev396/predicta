import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogoFull } from "@/components/brand/Logo";
import { Shield, Zap, ArrowUpRight, Twitter, Github, Mail } from "lucide-react";

const groups = [
  {
    title: "Product",
    items: [
      { label: "How It Works", href: "#how-it-works", isHash: true },
      { label: "Features", href: "#features", isHash: true },
      { label: "Packages", href: "#packages", isHash: true },
      { label: "Accuracy Reports", href: "#features", isHash: true },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Create Account", href: "/register" },
      { label: "Member Login", href: "/login" },
      { label: "Partner Program", href: "/partner-apply" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & FAQ", href: "#faq", isHash: true },
      { label: "Getting Started", href: "/register" },
      { label: "System Status", href: "/" },
      { label: "Account Security", href: "/privacy" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Acceptable Use", href: "/acceptable-use" },
    ],
  },
];

export function SiteFooter() {
  const navigate = useNavigate();
  const [legalClicks, setLegalClicks] = useState<Record<string, number>>({});

  const handleLegalClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const next = (legalClicks[href] ?? 0) + 1;
    if (next >= 4) {
      setLegalClicks((p) => ({ ...p, [href]: 0 }));
      void navigate({ to: href as any });
    } else {
      setLegalClicks((p) => ({ ...p, [href]: next }));
    }
  };

  return (
    <footer className="bg-[#F8F9FB] border-t border-[#E8EDF3]">

      {/* ── CTA band above footer ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #C50F1F 0%, #E41827 45%, #C50F1F 100%)",
        }}
      >
        {/* Subtle dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs font-mono font-bold tracking-widest text-red-200 uppercase mb-1">
                Ready to start?
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Expose your first instant virtual outcome today.
              </h3>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-700 shadow-lg hover:shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              Get Started Free
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Top row — logo + tagline + status */}
        <div
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 pb-10"
          style={{ borderBottom: "1px solid #E8EDF3" }}
        >
          <div className="max-w-xs">
            <Link to="/" aria-label="PREDICTA home" className="inline-block mb-3 hover:opacity-80 transition-opacity">
              <LogoFull variant="dark" className="h-7 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              High-precision breach intelligence for instant virtual simulation engines. Engineered for certainty.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Live status */}
            <div className="inline-flex items-center gap-2 self-start sm:self-end rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Predicta Core 2.4 · Operational
            </div>
            {/* Trust badges */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Shield className="size-3.5 text-slate-400" />
                256-bit Encryption
              </span>
              <span className="text-slate-200">·</span>
              <span className="inline-flex items-center gap-1">
                <Zap className="size-3.5 text-red-400" />
                Real-time Engine
              </span>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="mb-4 text-[11px] font-bold tracking-widest text-slate-900 uppercase">
                {g.title}
              </h3>
              <ul className="space-y-2.5">
                {g.items.map((item) => {
                  const isLegal = g.title === "Legal";
                  const cls = "text-sm text-slate-500 hover:text-red-600 transition-colors";

                  if (isLegal) {
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={(e) => handleLegalClick(e, item.href)}
                          className={`${cls} text-left cursor-pointer select-none`}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={item.label}>
                      {item.isHash ? (
                        <a href={item.href} className={cls}>{item.label}</a>
                      ) : (
                        <Link to={item.href as any} className={cls}>{item.label}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400"
          style={{ borderTop: "1px solid #E8EDF3" }}
        >
          <p>
            © {new Date().getFullYear()} PREDICTA. All rights reserved. For entertainment and informational simulation analytics only.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
              <Twitter className="size-3.5" />
            </span>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
              <Mail className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}