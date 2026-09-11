import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  ArrowRight,
  Zap,
  Cpu,
  Eye,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  BarChart3,
  Flame,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LiveTicker } from "@/components/site/LiveTicker";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { LogoSymbol } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const symbolLogo = "/predicta-symbol.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PREDICTA — Instant Virtuals Engineered with Precision" },
      {
        name: "description",
        content:
          "PREDICTA decodes SportyBet instant virtual match simulations in real-time. High-precision neural match intelligence before the game loads.",
      },
      { property: "og:title", content: "PREDICTA — Instant Virtuals Outcome Exposed" },
      {
        property: "og:description",
        content:
          "Our proprietary neural engine penetrates instant virtual simulations and delivers the next outcome with calibrated certainty.",
      },
    ],
    links: [{ rel: "canonical", href: "https://predicta.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "PREDICTA packages",
          itemListElement: [
            {
              name: "Starter",
              description: "2 scan credits, 2 outcomes per screenshot.",
              price: "250",
            },
            {
              name: "Plus",
              description: "3 scan credits, 4 outcomes per screenshot.",
              price: "350",
            },
            {
              name: "Premium",
              description: "5 scan credits, 8 outcomes per screenshot.",
              price: "500",
            },
          ].map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: `PREDICTA ${p.name}`,
              description: p.description,
              brand: { "@type": "Brand", name: "PREDICTA" },
              offers: {
                "@type": "Offer",
                price: p.price,
                priceCurrency: "GHS",
                availability: "https://schema.org/InStock",
                url: "https://predicta.lovable.app/#packages",
              },
            },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

const bentoItems = [
  {
    title: "Neural Vision OCR & Match Telemetry",
    subtitle: "Automated Frame Extraction",
    body: "Upload any raw SportyBet screenshot. The neural engine instantly decodes match identifiers, team names, and odds matrix with zero manual entry.",
    badge: "Vision AI",
    icon: Cpu,
    colSpan: "lg:col-span-2",
    accent: "from-blue-500/20 via-cyan-500/10 to-transparent",
  },
  {
    title: "Sub-Second Infiltration",
    subtitle: "<0.8s Exposure Latency",
    body: "Outcomes are intercepted and resolved ahead of the client-side game engine render pipeline.",
    badge: "Speed",
    icon: Zap,
    colSpan: "lg:col-span-1",
    accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
  },
  {
    title: "Strict 1X2 Deterministic Logic",
    subtitle: "Zero Guesswork",
    body: "Every prediction is strictly calibrated into Home Win, Draw, or Away Win with high probability bounds.",
    badge: "Precision",
    icon: BarChart3,
    colSpan: "lg:col-span-1",
    accent: "from-purple-500/20 via-pink-500/10 to-transparent",
  },
  {
    title: "Enterprise Isolated Enclaves",
    subtitle: "Hardware-grade Privacy",
    body: "Every scan operation runs inside isolated runtime environments over 256-bit encrypted channels. No data retention.",
    badge: "Security",
    icon: Lock,
    colSpan: "lg:col-span-2",
    accent: "from-cyan-500/20 via-blue-500/10 to-transparent",
  },
];

const steps = [
  {
    n: "01",
    title: "Capture Screenshot",
    body: "Take a screenshot of your SportyBet instant virtual match screen — PNG, JPG or WEBP.",
  },
  {
    n: "02",
    title: "Neural Match Decryption",
    body: "PREDICTA cross-references the simulation seed, reads the game identifier, and locks the next outcome.",
  },
  {
    n: "03",
    title: "Execute with Certainty",
    body: "Receive certified verdicts before kickoff. Play with engineered confidence, not probability guesswork.",
  },
];

const packages = [
  {
    name: "Starter",
    price: "GH₵250",
    credits: "2 outcomes per screenshot",
    summary: "Ideal for testing and single session runs.",
    perks: [
      "2 scan credits included",
      "Instant Virtual Football markets",
      "Full historical reports",
      "Standard telemetry support",
    ],
    popular: false,
    badge: null,
  },
  {
    name: "Plus",
    price: "GH₵350",
    credits: "4 outcomes per screenshot",
    summary: "Our most balanced tier for active daily players.",
    perks: [
      "3 scan credits included",
      "Instant Virtual Football markets",
      "Full historical reports",
      "Priority neural queue routing",
      "Fast-track admin approval",
    ],
    popular: true,
    badge: "Recommended",
  },
  {
    name: "Premium",
    price: "GH₵500",
    credits: "8 outcomes per screenshot",
    summary: "Maximum capacity for serious virtual analysts.",
    perks: [
      "5 scan credits included",
      "Instant Virtual Football markets",
      "Full historical reports",
      "Dedicated neural processing priority",
      "VIP direct WhatsApp support",
    ],
    popular: false,
    badge: "Maximum Intel",
  },
];

const faqs = [
  {
    q: "How does the PREDICTA neural engine operate?",
    a: "You upload a SportyBet instant virtual screenshot. PREDICTA's neural vision model extracts the simulation match ID, penetrates the engine's pre-rendered outcome feed, and delivers the decisive outcome before the match animations run.",
  },
  {
    q: "Which screenshot formats are accepted?",
    a: "PNG, JPG, JPEG and WEBP format screenshots from both mobile and desktop screens. High-resolution, readable odds produce the quickest verification.",
  },
  {
    q: "What are scan credits and how are they used?",
    a: "Each package provides a specific number of scan credits. One credit processes one screenshot and delivers the exposed instant virtual outcomes according to your tier.",
  },
  {
    q: "How are Mobile Money payments verified?",
    a: "Submit your payment details and reference code. Our administrative team verifies the transaction, and your credits are credited to your balance promptly.",
  },
  {
    q: "Is my user data private and secure?",
    a: "Yes. All operations run over secure 256-bit encrypted channels. Your scans, payments, reports, and phone credentials are confidential and visible only to you.",
  },
  {
    q: "Can I review previous analysis verdicts?",
    a: "Yes. Every completed analysis is logged in your secure History tab with match names, odds, timestamps, and confidence scores for ongoing tracking.",
  },
];

/* ── Apple Terminal Card Preview ── */
function AppleTerminalCard() {
  const outcomes = [
    { game: "SPBET-VIRT #4102", match: "Lions FC vs Eagles Utd", result: "HOME WIN (1)", odds: "1.85", status: "VERIFIED" },
    { game: "SPBET-VIRT #4103", match: "Storm City vs Thunder FC", result: "AWAY WIN (2)", odds: "2.10", status: "VERIFIED" },
    { game: "SPBET-VIRT #4104", match: "Phoenix FC vs Red Devils", result: "DRAW (X)", odds: "3.20", status: "VERIFIED" },
  ];

  return (
    <div className="w-full max-w-md lg:max-w-none mx-auto rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#0C0C12]/80 backdrop-blur-2xl border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
      {/* Subtle specular rim glare */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-[#2997FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[#A855F7]/15 blur-3xl" />

      {/* Window Controls Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-white/20" />
          <span className="size-3 rounded-full bg-white/20" />
          <span className="size-3 rounded-full bg-white/20" />
          <span className="ml-2.5 font-mono text-xs font-semibold text-neutral-300">
            PREDICTA Engine · Live Telemetry
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Locked</span>
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="space-y-2.5 relative z-10">
        {outcomes.map((v, i) => (
          <div
            key={v.game}
            className="rounded-2xl p-3.5 sm:p-4 bg-white/[0.03] border border-white/[0.07] hover:border-white/20 transition-all duration-300 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-wider truncate text-neutral-400 font-mono">
                  {v.game} · {v.match}
                </p>
                <p className="mt-1 text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                  {v.result}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2997FF]/15 text-[#64D2FF] border border-[#2997FF]/30">
                  <CheckCircle2 className="size-3" />
                  {v.status}
                </span>
                <p className="mt-1 text-xs sm:text-sm font-mono font-bold text-neutral-300">
                  @{v.odds}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-400 relative z-10">
        <span className="flex items-center gap-2">
          <Cpu className="size-3.5 text-[#2997FF]" />
          <span>Neural Model: Predicta-2.4-Pro</span>
        </span>
        <span className="font-mono text-neutral-300 font-medium">99.4% Calibrated</span>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F7] selection:bg-[#2997FF] selection:text-white" style={{ overflowX: "clip" }}>
      <SiteNavbar />
      <LiveTicker />

      <main className="relative">
        {/* ── HERO SECTION (Apple Keynote Style) ── */}
        <section id="overview" className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden">
          {/* Ambient Lighting / Keynote Spotlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[650px]"
            style={{
              background:
                "radial-gradient(ellipse 90% 50% at 50% -10%, rgba(41, 151, 255, 0.22), rgba(0, 210, 255, 0.08), transparent 75%)",
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Keynote Typography */}
              <div className="lg:col-span-7 text-left">
                {/* Micro Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-md mb-6 shadow-xs">
                  <span className="size-2 rounded-full bg-[#2997FF] animate-pulse" />
                  <span>PREDICTA Intelligence · Virtual Neural Engine</span>
                  <ChevronRight className="size-3 text-neutral-500" />
                </div>

                {/* Master Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white">
                  Instant Virtuals.{" "}
                  <span className="block bg-gradient-to-r from-[#2997FF] via-[#64D2FF] to-[#BF5AF2] bg-clip-text text-transparent">
                    Engineered Precision.
                  </span>
                </h1>

                {/* Refined Subheadline */}
                <p className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-neutral-400 font-normal max-w-xl">
                  The breakthrough simulation intelligence platform. Upload any SportyBet instant virtual screenshot and decode the locked match outcome before kickoff.
                </p>

                {/* Apple CTA Pills */}
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black hover:bg-neutral-200 text-sm font-semibold px-7 py-3.5 shadow-lg shadow-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <a
                    href="#specs"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/10 text-white text-sm font-medium px-6 py-3.5 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Layers className="size-4 text-neutral-400" />
                    <span>View Architecture Specs</span>
                  </a>
                </div>

                {/* Specs Row */}
                <div className="mt-12 pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      <AnimatedCounter end={99} suffix="%" className="tabular-nums" />
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">Match Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      &lt;0.8s
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">Neural Latency</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      24/7
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">Always Online</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hardware Glass Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <AppleTerminalCard />
              </div>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID SECTION (Apple Specs & Architecture) ── */}
        <section id="specs" className="py-20 sm:py-28 relative border-t border-white/[0.06] bg-[#060608]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Header */}
            <div className="max-w-2xl text-left mb-12 sm:mb-16">
              <span className="text-xs font-semibold tracking-widest text-[#2997FF] uppercase">
                Architecture &amp; Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2.5">
                Engineered for certainty. Built for speed.
              </h2>
              <p className="mt-3.5 text-base sm:text-lg text-neutral-400">
                Every component of PREDICTA is designed to eliminate guesswork from instant virtual simulations.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {bentoItems.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "rounded-3xl p-6 sm:p-8 bg-[#0C0C12] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative overflow-hidden group shadow-lg",
                    item.colSpan
                  )}
                >
                  {/* Subtle hover gradient glow */}
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      item.accent
                    )}
                  />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-white">
                          <item.icon className="size-5" />
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-neutral-300">
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-[#2997FF] uppercase tracking-wider">
                        {item.subtitle}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-400">
                        {item.body}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                      <span>Telemetry Verified</span>
                      <ChevronRight className="size-4 text-neutral-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORKFLOW SECTION (Apple Step Sequence) ── */}
        <section id="workflow" className="py-20 sm:py-28 relative border-t border-white/[0.06] bg-[#0A0A0E]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl text-left mb-12 sm:mb-16">
              <span className="text-xs font-semibold tracking-widest text-[#2997FF] uppercase">
                Simplicity at Scale
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2.5">
                Three steps from screenshot to verdict.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, idx) => (
                <div
                  key={s.n}
                  className="rounded-3xl p-6 sm:p-8 bg-[#060608] border border-white/[0.08] relative group hover:border-white/20 transition-all duration-300"
                >
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white/20 group-hover:text-[#2997FF]/60 transition-colors">
                    {s.n}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-4">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-400">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING / PACKAGES (Apple One / Pro Tier Style) ── */}
        <section id="packages" className="py-20 sm:py-28 relative border-t border-white/[0.06] bg-[#060608]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl text-center mx-auto mb-14 sm:mb-20">
              <span className="text-xs font-semibold tracking-widest text-[#2997FF] uppercase">
                Transparent Credits
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2.5">
                Choose your intelligence tier.
              </h2>
              <p className="mt-3.5 text-base sm:text-lg text-neutral-400">
                1 scan credit processes 1 screenshot and unlocks certified match outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={cn(
                    "rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative",
                    pkg.popular
                      ? "bg-[#0F121C] border-2 border-[#2997FF] shadow-[0_0_60px_-15px_rgba(41,151,255,0.3)]"
                      : "bg-[#0C0C12] border border-white/[0.08] hover:border-white/20"
                  )}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#2997FF] text-white text-[11px] font-semibold px-3.5 py-1 tracking-wide uppercase shadow-md">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {pkg.name}
                      </h3>
                      <span className="text-xs text-neutral-400 font-mono">
                        {pkg.credits}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {pkg.price}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                      {pkg.summary}
                    </p>

                    <div className="my-6 border-t border-white/[0.08]" />

                    <ul className="space-y-3 text-xs text-neutral-300">
                      {pkg.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2.5">
                          <CheckCircle2 className="size-4 text-[#2997FF] shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Link
                      to="/register"
                      className={cn(
                        "w-full flex items-center justify-center rounded-full py-3 text-xs font-semibold tracking-wide transition-all duration-200",
                        pkg.popular
                          ? "bg-[#2997FF] hover:bg-[#0077ED] text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      Select {pkg.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CUPERTINO FAQ SECTION ── */}
        <section id="faq" className="py-20 sm:py-28 relative border-t border-white/[0.06] bg-[#0A0A0E]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-semibold tracking-widest text-[#2997FF] uppercase">
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2.5">
                Answers &amp; Intelligence.
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f) => (
                <AccordionItem
                  key={f.q}
                  value={f.q}
                  className="rounded-2xl border border-white/[0.08] bg-[#060608] px-5 sm:px-6 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-white hover:text-[#2997FF] py-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm leading-relaxed text-neutral-400 pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── KEYNOTE FINAL CTA ── */}
        <section className="py-20 sm:py-28 relative border-t border-white/[0.08] overflow-hidden bg-[#060608]">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(41, 151, 255, 0.15), rgba(168, 85, 247, 0.08), transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Ready to Experience Instant Foresight?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
              Join PREDICTA today and start decoding SportyBet instant virtuals with engineered accuracy.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black hover:bg-neutral-200 text-sm font-semibold px-8 py-3.5 shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create Your Account</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white text-sm font-medium px-7 py-3.5 backdrop-blur-md transition-all duration-200"
              >
                <span>Sign In to Workspace</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
