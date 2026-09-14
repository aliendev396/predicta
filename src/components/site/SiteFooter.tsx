import { Link } from "@tanstack/react-router";
import { LogoFull } from "@/components/brand/Logo";
import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const footerNav = [
    {
      title: "PLATFORM",
      links: [
        { label: "Predictive Engine", href: "#features" },
        { label: "Algorithm Architecture", href: "#how-it-works" },
        { label: "Verification Ledger", href: "#trust" },
        { label: "Pricing & Access", href: "#pricing" },
      ],
    },
    {
      title: "PRODUCTS",
      links: [
        { label: "V-League Predictor", href: "/register" },
        { label: "Instant Virtuals Decoder", href: "/register" },
        { label: "Realtime API Feed", href: "/register" },
        { label: "Enterprise Terminal", href: "/register" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { label: "Documentation", href: "#faq" },
        { label: "Frequently Asked", href: "#faq" },
        { label: "System Status", href: "#" },
        { label: "Compliance & Security", href: "#" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { label: "About PREDICTA", href: "#" },
        { label: "Research Lab", href: "#" },
        { label: "Contact Intelligence", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Top Editorial Banner */}
        <div className="border-b border-slate-800 pb-12 sm:pb-16 mb-12 sm:mb-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase block mb-3">
              INSTANT OUTCOME EXPOSURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ready to eliminate outcome uncertainty?
            </h2>
            <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
              Gain instant access to real-time RNG decoders and predictive neural feeds.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] max-w-full truncate"
            >
              Get Instant Access
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-slate-800">
          {/* Brand Info Column */}
          <div className="col-span-1 sm:col-span-2 space-y-4 sm:space-y-6">
            <LogoFull className="h-7 sm:h-8 w-auto text-white" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              PREDICTA is the premier outcome analysis platform for instant virtuals. Operating at high precision with deterministic seed calculation protocols.
            </p>
            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ALL SYSTEMS OPERATIONAL (99.98% ACCURACY)
            </div>
          </div>

          {/* Navigation Columns */}
          {footerNav.map((col) => (
            <div key={col.title} className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                {col.title}
              </h3>
              <ul className="space-y-2 font-sans">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
          <p>© {currentYear} PREDICTA PLATFORM. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-[10px] sm:text-[11px]">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">PRIVACY POLICY</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">TERMS & CONDITIONS</Link>
            <Link to="/acceptable-use" className="hover:text-slate-300 transition-colors">ACCEPTABLE USE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}