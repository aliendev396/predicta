import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ArrowUpRight,
  Lock,
  Zap,
  ChevronDown,
  Activity,
  Terminal as TerminalIcon,
  Cpu,
  Eye,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { LiveTicker } from "@/components/site/LiveTicker";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      code: "01 // VISION OCR",
      title: "Real-Time Frame Analytics",
      description:
        "High-resolution visual recognition parsing match parameters, team lineups, and live odds instantly from uploaded screenshots.",
      badge: "SUB-SECOND VISION",
    },
    {
      code: "02 // NEURAL",
      title: "Multi-Factor Probability Matrix",
      description:
        "Multi-layered prediction engine cross-referencing over 14 million historical outcome cycles and team scoring distributions.",
      badge: "99.8% PRECISION",
    },
    {
      code: "03 // VERIFICATION",
      title: "Immutable Audit Ledger",
      description:
        "Transparent timestamped record verifying outcome predictions prior to public match completion.",
      badge: "VERIFIED PROOF",
    },
    {
      code: "04 // TELEMETRY",
      title: "Automated Signal Dispatch",
      description:
        "High-velocity delivery pushing decisive match verdicts directly to your personal dashboard workspace.",
      badge: "REALTIME FEED",
    },
  ];

  const methodologySteps = [
    {
      number: "01",
      title: "Visual Screenshot Ingestion",
      subtitle: "IMAGE OCR PARSING",
      description:
        "Upload any instant or virtual football match screenshot. PREDICTA's visual engine parses raw fixture data and team lines in milliseconds.",
    },
    {
      number: "02",
      title: "Probability Reconstruction",
      subtitle: "PATTERN MATCHING",
      description:
        "Extracted parameters run through PREDICTA's neural engine, mapping statistical goal expectations and market probabilities.",
    },
    {
      number: "03",
      title: "Decisive Verdict Dispatch",
      subtitle: "INSTANT VERDICT",
      description:
        "Receive clear, high-confidence match recommendations directly on your screen before public graphics finish rendering.",
    },
  ];

  const trustPillars = [
    {
      title: "Deterministic Auditing",
      description: "Every verdict is timestamped and logged onto our public ledger prior to kickoff.",
      icon: ShieldCheck,
    },
    {
      title: "Direct Visual Feeds",
      description: "Low-latency streaming endpoints engineered for rapid visual outcome analysis.",
      icon: Cpu,
    },
    {
      title: "99.8% Backtested Accuracy",
      description: "Rigorous daily validation across all major virtual football leagues and cup tournaments.",
      icon: Award,
    },
  ];

  const faqs = [
    {
      q: "How does PREDICTA calculate match outcomes from screenshots?",
      a: "PREDICTA uses advanced OCR computer vision and neural pattern recognition to extract fixture details, league parameters, and odds distributions from uploaded screenshots. The data is cross-referenced against historical match matrices to deliver 99.8% accurate picks.",
    },
    {
      q: "Which virtual leagues and platforms are supported?",
      a: "PREDICTA supports all major instant virtual football leagues (V-League, Premier Virtual, Spanish Virtual), instant cups, and high-frequency virtual match engines across major international bookmakers.",
    },
    {
      q: "How fast is the screenshot analysis process?",
      a: "Visual frame parsing and outcome calculation complete within seconds, providing clear, high-confidence recommendations before match graphics finish rendering.",
    },
    {
      q: "Can I test the platform before choosing a long-term plan?",
      a: "Yes. Our Starter Analyst tier grants full access to test predictive screenshot scans with zero long-term commitment.",
    },
    {
      q: "What payment options are supported?",
      a: "We accept Mobile Money (MoMo) and major debit/credit cards via our secure 256-bit encrypted checkout gateway.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation */}
      <SiteNavbar />

      {/* Hero Section — Refined Institutional Visual AI */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Glow Accent */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-fade-in">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-widest border border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#e41827]" />
            <span>AI VISION ENGINE · V4.2 LIVE</span>
          </div>

          {/* Headline - Clean & Powerful */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 uppercase leading-[1.08] max-w-4xl">
            VISUAL ANALYTICS FOR <span className="text-red-600 underline decoration-red-600/30 decoration-wavy decoration-2">INSTANT VIRTUALS OUTCOMES</span>.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed px-2">
            Transform virtual match screenshots into high-confidence outcome intelligence. PREDICTA combines visual pattern recognition with historical probability models before kickoff.
          </p>

          {/* Primary CTA Group */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 w-full max-w-full px-2 sm:px-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider bg-red-600 hover:bg-slate-950 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 shadow-md shadow-red-600/25 hover:shadow-lg max-w-full truncate cursor-pointer"
            >
              Analyze Match Screenshot
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-950 border border-slate-300 hover:border-slate-950 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all bg-white max-w-full truncate cursor-pointer"
            >
              Explore Methodology
            </a>
          </div>

          {/* Live Outcome Terminal Preview Card */}
          <div className="w-full mt-8 sm:mt-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-8 text-left shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-700/70 border-t-2 border-t-red-500/80 relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[90px] pointer-events-none" />

            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-[10px] sm:text-xs font-bold text-slate-300 truncate max-w-[160px] sm:max-w-none">
                  predicta-neural-vision // real-time visual feed
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-md shadow-sm">
                LIVE VISION STREAM
              </span>
            </div>

            {/* Live Ticker Items */}
            <div className="space-y-3 font-mono text-xs text-slate-300 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-red-400 font-bold text-[10px] bg-red-950/90 border border-red-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider">[ANALYSIS VERIFIED]</span>
                  <span className="text-white font-bold">ARSENAL vs CHELSEA</span>
                  <span className="text-slate-400 text-[11px]">(V-LEAGUE R402)</span>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm">HOME WIN (3-1)</span>
                  <span className="text-[10px] text-slate-300 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded font-bold">99.4% CONF.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/90 border border-emerald-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider">[MATCHED RESULT]</span>
                  <span className="text-white font-bold">REAL MADRID vs BARCELONA</span>
                  <span className="text-slate-400 text-[11px]">(INSTANT CUP #882)</span>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-slate-100 font-bold text-xs sm:text-sm">OVER 2.5 GOALS</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-bold">VERIFIED ✅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <LiveTicker />

      {/* Stat Values Banner — Sleek Gradient & Institutional Micro-Cards */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-10 sm:py-16 px-4 sm:px-8 lg:px-12 border-b border-slate-800/80 relative overflow-hidden">
        {/* Ambient Red Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {/* Stat Card 1 */}
          <div className="bg-slate-900/90 border border-slate-700/80 border-t-2 border-t-red-500 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-red-500 hover:shadow-[0_10px_30px_rgba(228,24,39,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md group">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono text-red-500 tracking-tight group-hover:scale-105 transition-transform">
                99.8%
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
              Verified Model Accuracy
            </span>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-slate-900/90 border border-slate-700/80 border-t-2 border-t-slate-600 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-slate-500 hover:shadow-[0_10px_30px_rgba(255,255,255,0.06)] hover:-translate-y-1 transition-all duration-300 shadow-md group">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono text-white tracking-tight group-hover:scale-105 transition-transform">
              &lt;0.04s
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
              Visual Processing Speed
            </span>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-slate-900/90 border border-slate-700/80 border-t-2 border-t-slate-600 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-slate-500 hover:shadow-[0_10px_30px_rgba(255,255,255,0.06)] hover:-translate-y-1 transition-all duration-300 shadow-md group">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono text-white tracking-tight group-hover:scale-105 transition-transform">
              14.2M+
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
              Match Cycles Analyzed
            </span>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-slate-900/90 border border-slate-700/80 border-t-2 border-t-emerald-500 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-emerald-400 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md group">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono text-emerald-400 tracking-tight group-hover:scale-105 transition-transform">
                24/7
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
              Automated Signal Stream
            </span>
          </div>
        </div>
      </section>

      {/* Features Section — Editorial Grid */}
      <section id="features" className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
            ENGINE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 uppercase">
            BUILT FOR HIGH-FREQUENCY ACCURACY.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            PREDICTA operates with direct computer vision parsing, calculating high-probability outcome vectors before public match completion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((item) => (
            <div
              key={item.title}
              className="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200 hover:border-red-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(224,36,36,0.12)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                    {item.code}
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="pt-6 sm:pt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-950 group-hover:text-red-600 transition-colors">
                <span>Technical Specifications</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology — Numbered Steps */}
      <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
              PREDICTIVE METHODOLOGY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 uppercase">
              HOW VISUAL INTELLIGENCE WORKS.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {methodologySteps.map((step) => (
              <div key={step.number} className="relative space-y-3 sm:space-y-4 pt-6 sm:pt-8 border-t-2 border-slate-900">
                <span className="text-5xl sm:text-7xl font-black font-mono text-slate-200 block -mt-4">
                  {step.number}
                </span>
                <span className="text-xs font-mono font-bold text-red-600 tracking-widest uppercase block">
                  {step.subtitle}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 uppercase">{step.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Pillars — Dark Section */}
      <section id="trust" className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
              UNCOMPROMISED INTEGRITY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
              VERIFIABLE CRYPTOGRAPHIC LEDGER.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We publish prediction timestamps to an immutable block log before match conclusion, enabling complete post-match auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-red-500/60 shadow-xl hover:shadow-[0_15px_35px_rgba(228,24,39,0.15)] hover:-translate-y-1 transition-all duration-300 space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-800/70 flex items-center justify-center text-red-500 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase">{pillar.title}</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* FAQ Accordion */}
      <section id="faq" className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
              FREQUENTLY ASKED
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 uppercase">
              INTELLIGENCE DISCLOSURES.
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-950 uppercase hover:text-red-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      openFaq === idx ? "rotate-180 text-red-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
