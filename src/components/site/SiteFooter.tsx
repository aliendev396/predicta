import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogoFull } from "@/components/brand/Logo";
import { Shield, Sparkles } from "lucide-react";

const groups = [
  {
    title: "Intelligence",
    items: [
      { label: "Overview", href: "/#overview", isHash: true },
      { label: "Neural Engine", href: "/#engine", isHash: true },
      { label: "Bento Specs", href: "/#specs", isHash: true },
      { label: "Accuracy Reports", href: "/#specs", isHash: true },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Packages & Tiers", href: "/#packages", isHash: true },
      { label: "Partner Program", href: "/partner-apply" },
      { label: "Create Account", href: "/register" },
      { label: "Member Login", href: "/login" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & FAQ", href: "/#faq", isHash: true },
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
    <footer className="border-t border-white/[0.08] bg-[#060608] text-neutral-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 sm:px-6">
        {/* Top brand row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-white/[0.06]">
          <div>
            <Link to="/" aria-label="PREDICTA home" className="inline-block transition-opacity hover:opacity-85">
              <LogoFull className="h-7 sm:h-8 w-auto" />
            </Link>
            <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-neutral-500">
              High-precision predictive neural intelligence for instant virtual simulation engines. Engineered for certainty.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-neutral-300">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Predicta Core 2.4 · Operational</span>
            </div>
          </div>
        </div>

        {/* Links grid — Apple multi-column directory */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-[12px] font-semibold tracking-wider text-neutral-300 uppercase">
                {g.title}
              </h3>
              <ul className="mt-3.5 space-y-2.5">
                {g.items.map((item) => {
                  const isLegalGroup = g.title === "Legal";

                  if (isLegalGroup) {
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={(e) => handleLegalClick(e, item.href)}
                          className="text-left text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer select-none"
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
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.href as any}
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
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

        {/* Bottom bar — Apple clean copyright */}
        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between text-xs text-neutral-500">
          <p>
            Copyright © {new Date().getFullYear()} PREDICTA Inc. All rights reserved. For entertainment and informational simulation analytics only.
          </p>
          <div className="flex items-center gap-4 flex-wrap text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5 text-[#2997FF]" />
              256-Bit Hardware Encryption
            </span>
            <span className="text-neutral-600">·</span>
            <span>Accredited Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}