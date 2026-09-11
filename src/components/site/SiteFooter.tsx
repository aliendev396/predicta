import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogoFull } from "@/components/brand/Logo";
import { Shield, Zap } from "lucide-react";

const groups = [
  {
    title: "Intelligence",
    items: [
      { label: "Overview", href: "/#overview", isHash: true },
      { label: "How It Works", href: "#how-it-works", isHash: true },
      { label: "Features", href: "#features", isHash: true },
      { label: "Accuracy Reports", href: "#features", isHash: true },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Packages & Tiers", href: "#packages", isHash: true },
      { label: "Partner Program", href: "/partner-apply" },
      { label: "Create Account", href: "/register" },
      { label: "Member Login", href: "/login" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & FAQ", href: "#faq", isHash: true },
      { label: "Getting Started", href: "/register" },
      { label: "Account Security", href: "/privacy" },
      { label: "System Status", href: "/" },
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
    const current = legalClicks[href] ?? 0;
    const next = current + 1;
    if (next >= 4) {
      setLegalClicks((prev) => ({ ...prev, [href]: 0 }));
      void navigate({ to: href as any });
    } else {
      setLegalClicks((prev) => ({ ...prev, [href]: next }));
    }
  };

  return (
    <footer
      style={{
        background: "#080206",
        borderTop: "1px solid rgba(228, 24, 39, 0.18)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top brand band */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-10"
          style={{ borderBottom: "1px solid rgba(228,24,39,0.10)" }}
        >
          <div>
            <Link to="/" aria-label="PREDICTA home" className="inline-block transition-opacity hover:opacity-80">
              <LogoFull className="h-7 sm:h-8 w-auto" />
            </Link>
            <p className="mt-2.5 max-w-sm text-xs leading-relaxed" style={{ color: "rgba(240,240,240,0.38)" }}>
              High-precision breach intelligence for instant virtual simulation engines. Engineered for certainty — not chance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-mono font-semibold"
              style={{
                border: "1px solid rgba(16,185,129,0.30)",
                background: "rgba(16,185,129,0.06)",
                color: "#6ee7b7",
              }}
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Predicta Core 2.4 · Operational
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h3
                className="text-[11px] font-bold tracking-widest uppercase mb-3.5"
                style={{ color: "rgba(228,24,39,0.85)" }}
              >
                {g.title}
              </h3>
              <ul className="space-y-2.5">
                {g.items.map((item) => {
                  const isLegalGroup = g.title === "Legal";
                  const linkStyle = { color: "rgba(240,240,240,0.40)" };
                  const hoverEnter = (e: React.MouseEvent<HTMLElement>) =>
                    (e.currentTarget.style.color = "rgba(240,240,240,0.90)");
                  const hoverLeave = (e: React.MouseEvent<HTMLElement>) =>
                    (e.currentTarget.style.color = "rgba(240,240,240,0.40)");

                  if (isLegalGroup) {
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={(e) => handleLegalClick(e, item.href)}
                          className="text-left text-xs cursor-pointer select-none transition-colors"
                          style={linkStyle}
                          onMouseEnter={hoverEnter}
                          onMouseLeave={hoverLeave}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      {item.isHash ? (
                        <a
                          href={item.href}
                          className="text-xs transition-colors"
                          style={linkStyle}
                          onMouseEnter={hoverEnter}
                          onMouseLeave={hoverLeave}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.href as any}
                          className="text-xs transition-colors"
                          style={linkStyle}
                          onMouseEnter={hoverEnter}
                          onMouseLeave={hoverLeave}
                        >
                          {item.label}
                        </Link>
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
          className="flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between text-xs"
          style={{ borderTop: "1px solid rgba(228,24,39,0.10)", color: "rgba(240,240,240,0.30)" }}
        >
          <p>
            Copyright © {new Date().getFullYear()} PREDICTA. All rights reserved. For entertainment and informational simulation analytics only.
          </p>
          <div className="flex items-center gap-4 flex-wrap" style={{ color: "rgba(240,240,240,0.40)" }}>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5 text-emerald-500" />
              256-Bit Encryption
            </span>
            <span style={{ color: "rgba(228,24,39,0.35)" }}>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-red-500" />
              Real-time Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}