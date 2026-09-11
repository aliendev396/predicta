import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Lock,
  Receipt,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Terminal,
  Cpu,
  Activity,
  Eye,
  Wifi,
  Database,
  AlertTriangle,
  ScanSearch,
  ArrowUpRight,
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
import { FloatingParticles } from "@/components/site/FloatingParticles";
import { GlitchText } from "@/components/site/GlitchText";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PREDICTA — Instant Virtuals Outcome Exposed" },
      {
        name: "description",
        content:
          "PREDICTA exposes the next SportyBet instant virtual outcome before the game loads. Upload your screenshot, hack the result, play with certainty.",
      },
      { property: "og:title", content: "PREDICTA — Instant Virtuals Outcome Exposed" },
      {
        property: "og:description",
        content:
          "Our algorithm penetrates the SportyBet instant virtual engine and delivers the next outcome — no guesswork, just exposed results.",
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
            { name: "Starter", description: "2 scan credits.", price: "250" },
            { name: "Plus", description: "3 scan credits.", price: "350" },
            { name: "Premium", description: "5 scan credits.", price: "500" },
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

const features = [
  {
    icon: Cpu,
    title: "Algorithm Precision",
    body: "Our proprietary breach engine decodes each virtual match frame with machine-level accuracy. Results are locked — zero second-guessing.",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    icon: Trophy,
    title: "Proven Strikes",
    body: "Thousands of users have already exposed outcomes daily. Numbers don't lie — our track record proves it.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "Zero Traces",
    body: "All breach operations are encrypted end-to-end. Your account, uploads, and exposed outcomes leave no trail.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    body: "Upload your screenshot. Our system penetrates the virtual feed and returns the exposed outcome in seconds.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

const steps = [
  {
    n: "01",
    title: "Upload",
    body: "Drop your SportyBet instant virtual screenshot — PNG, JPG or WEBP. Our system reads the game identifier.",
    accent: "text-red-600",
    accentBg: "bg-red-50",
    accentBorder: "border-red-100",
  },
  {
    n: "02",
    title: "Penetrate",
    body: "The algorithm breaches the virtual engine feed, cross-references the match ID, and locks the next outcome.",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-100",
  },
  {
    n: "03",
    title: "Expose",
    body: "Receive your certified outcome — confirmed before the game loads. Bet with certainty, not chance.",
    accent: "text-red-600",
    accentBg: "bg-red-50",
    accentBorder: "border-red-100",
  },
];

const packages = [
  {
    name: "Starter",
    price: "GH₵250",
    credits: "2 outcomes per screenshot",
    perks: ["2 scan credits", "Instant Virtual Football only", "Outcome history", "Email support"],
    popular: false,
    badge: null,
  },
  {
    name: "Plus",
    price: "GH₵350",
    credits: "4 outcomes per screenshot",
    perks: ["3 scan credits", "Instant Virtual Football only", "Outcome history", "Priority email support"],
    popular: false,
    badge: "🔥 Best Value",
  },
  {
    name: "Premium",
    price: "GH₵500",
    credits: "8 outcomes per screenshot",
    perks: ["5 scan credits", "Instant Virtual Football only", "Outcome history", "Priority support"],
    popular: true,
    badge: "⚡ Most Popular",
  },
];

const trust = [
  { icon: Lock, title: "Fully encrypted", body: "Every breach operation runs over 256-bit encrypted tunnels. Nothing leaks.", color: "text-red-600", bg: "bg-red-50" },
  { icon: ShieldCheck, title: "Verified outcomes", body: "Every exposed result passes through our multi-layer verification engine.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: TrendingUp, title: "Consistent delivery", body: "Tens of thousands of outcomes delivered with zero downtime.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Receipt, title: "Transparent pricing", body: "Clear credit packages, visible history — no hidden fees, ever.", color: "text-amber-600", bg: "bg-amber-50" },
];

const faqs = [
  {
    q: "How does the outcome exposure system work?",
    a: "You upload a SportyBet instant virtual screenshot. PREDICTA's algorithm reads the game ID, penetrates the virtual engine's outcome feed, and delivers the result before the match is rendered.",
  },
  {
    q: "Which image formats are supported?",
    a: "PNG, JPG, JPEG and WEBP screenshots. Clear, high-resolution images produce the most accurate outcome exposures.",
  },
  {
    q: "What are scan credits?",
    a: "Each package includes scan credits. One credit processes one screenshot and delivers your exposed instant virtual outcome. Credits are consumed per scan.",
  },
  {
    q: "Is my account secure?",
    a: "Accounts use managed authentication with enterprise-grade access controls. Your profile, payments, outcomes and notifications are only visible to you.",
  },
  {
    q: "How is payment verified?",
    a: "Submit your payment with its reference. It is recorded as pending, reviewed by an administrator, and credits are added only once the payment is approved.",
  },
  {
    q: "Can I review past exposed outcomes?",
    a: "Yes. Every completed exposure is saved to your history with its ID, date, image and status — and can be reopened or downloaded at any time.",
  },
];

/* ── Terminal hack card ── */
function TerminalHackCard() {
  const outcomes = [
    { game: "SPBET-VIRT #3291", match: "Lions FC vs Eagles Utd", result: "HOME WIN", odds: "1.85" },
    { game: "SPBET-VIRT #3292", match: "Storm City vs Thunder FC", result: "OVER 2.5 GOALS", odds: "1.72" },
    { game: "SPBET-VIRT #3293", match: "Phoenix FC vs Red Devils", result: "BTTS — YES", odds: "1.90" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl font-mono"
      style={{ boxShadow: "0 24px 64px rgba(228,24,39,0.15), 0 8px 24px rgba(0,0,0,0.12)" }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-[#1A0E16]">
        <span className="size-3 rounded-full bg-red-500" />
        <span className="size-3 rounded-full bg-yellow-500" />
        <span className="size-3 rounded-full bg-emerald-500" />
        <span className="ml-3 text-[10px] tracking-wider text-emerald-400 flex-1 truncate">
          root@predicta:~$ ./breach_sportybet.sh
        </span>
        <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-terminal-cursor" />
      </div>

      {/* Body */}
      <div className="bg-[#0F0A0D] p-4 sm:p-5 relative">
        {/* scan line */}
        <div className="animate-scan-line" />

        {/* Status */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-status-blink" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-400">BREACH ACTIVE</span>
          </div>
          <span
            className="text-[10px] font-bold rounded-md px-2 py-0.5 font-mono"
            style={{ background: "rgba(228,24,39,0.15)", border: "1px solid rgba(228,24,39,0.35)", color: "#f87171" }}
          >
            3 OUTCOMES EXPOSED
          </span>
        </div>

        {/* Outcomes */}
        <div className="space-y-2">
          {outcomes.map((v, i) => (
            <div
              key={v.game}
              className="rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(228,24,39,0.14)",
                animation: `slide-up-fade 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.15}s both`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] tracking-wider text-neutral-500 truncate">{v.game} · {v.match}</p>
                  <p className="mt-0.5 text-xs font-bold text-white">{v.result}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}
                  >
                    <Check className="size-2.5" /> EXPOSED
                  </span>
                  <p className="mt-0.5 text-[9px] font-bold text-emerald-400">@{v.odds}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="mt-4 rounded-xl p-3"
          style={{ background: "rgba(228,24,39,0.08)", border: "1px solid rgba(228,24,39,0.18)" }}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold mb-2">
            <span className="text-red-400">SYSTEM ACCESS: GRANTED</span>
            <span className="text-emerald-400">✓ EXPOSED</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
            <div className="h-full rounded-full animate-hack-bar" style={{ background: "linear-gradient(90deg, #E41827, #10b981)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteNavbar />
      <LiveTicker />

      <main>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-white">
          {/* Subtle radial tint top-right */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 80% -10%, rgba(228,24,39,0.06) 0%, transparent 65%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 40% 35% at 0% 100%, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
          />

          <FloatingParticles />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
            {/* Left */}
            <div className="animate-rise">
              {/* Badge */}
              <div className="mb-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold tracking-widest text-red-600 font-mono">
                  <span className="size-1.5 rounded-full bg-red-500 animate-status-blink" />
                  SYSTEM BREACH ACTIVE
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                Instant Virtuals.{" "}
                <GlitchText className="text-red-600">Outcome Exposed.</GlitchText>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
                Our proprietary algorithm penetrates the{" "}
                <span className="font-bold text-emerald-600">SportyBet instant virtual engine</span>{" "}
                — delivering the next match outcome before the game even loads. No guesswork. Just exposed results.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", boxShadow: "0 8px 24px rgba(228,24,39,0.30)" }}
                >
                  HACK THE OUTCOME
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <Terminal className="size-4 text-emerald-600" />
                  See How It Works
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 flex flex-wrap gap-6 pt-8 border-t border-slate-100">
                <div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    <AnimatedCounter end={99} suffix="%" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Accuracy rate</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    <AnimatedCounter end={14} suffix="K+" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Outcomes exposed</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-2xl font-extrabold font-mono text-slate-900">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-status-blink" />
                    24/7
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Always live</div>
                </div>
              </div>
            </div>

            {/* Right — terminal */}
            <div className="animate-rise" style={{ animationDelay: "0.12s" }}>
              <TerminalHackCard />
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="section-line" />

        {/* ── FEATURES ── */}
        <section id="features" className="bg-[#F8F9FB] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold tracking-widest text-red-600 font-mono uppercase inline-flex items-center gap-1.5 mb-3">
                <Activity className="size-3.5" />
                WHY OUR ALGORITHM NEVER FAILS
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Built to Expose, Not Guess
              </h2>
              <p className="mt-3 text-slate-600">
                Every component is engineered to deliver certainty — not predictions.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default"
                >
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-xl mb-4", f.iconBg)}>
                    <f.icon className={cn("size-5", f.iconColor)} />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-mono">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line" />

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="bg-white py-16 sm:py-24">
          <FloatingParticles />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold tracking-widest text-emerald-600 font-mono uppercase inline-flex items-center gap-1.5 mb-3">
                <Wifi className="size-3.5" />
                BREACH PROTOCOL
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How The System Works
              </h2>
              <p className="mt-3 text-slate-600">
                Three steps from screenshot to exposed instant virtual outcome.
              </p>
            </div>

            <ol className="grid gap-6 sm:grid-cols-3">
              {steps.map((s, idx) => (
                <li
                  key={s.n}
                  className={cn(
                    "group relative rounded-2xl border p-7 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden",
                    s.accentBorder
                  )}
                >
                  {/* Ghost step number */}
                  <div
                    className="pointer-events-none absolute -right-3 -bottom-3 text-[100px] font-black font-mono leading-none select-none opacity-[0.05]"
                    style={{ color: idx === 1 ? "#10b981" : "#E41827" }}
                  >
                    {s.n}
                  </div>
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-xl text-sm font-extrabold font-mono mb-4", s.accentBg, s.accent)}>
                    {s.n}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="section-line" />

        {/* ── TRUST ── */}
        <section className="bg-[#F8F9FB] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold tracking-widest text-red-600 font-mono uppercase inline-flex items-center gap-1.5 mb-3">
                <Database className="size-3.5" />
                OPERATIONAL INTEGRITY
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Built on Trust, Hardened by Design
              </h2>
              <p className="mt-3 text-slate-600">
                Every layer of PREDICTA is engineered for security, reliability, and transparency.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((t) => (
                <div
                  key={t.title}
                  className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default"
                >
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-xl mb-4", t.bg)}>
                    <t.icon className={cn("size-5", t.color)} />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 font-mono">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line" />

        {/* ── PACKAGES ── */}
        <section id="packages" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold tracking-widest text-red-600 font-mono uppercase inline-flex items-center gap-1.5 mb-3">
                <ScanSearch className="size-3.5" />
                CREDIT PACKAGES
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Choose Your Intel Tier
              </h2>
              <p className="mt-3 text-slate-600">
                One credit = one screenshot scan = one exposed outcome.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={cn(
                    "relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1",
                    pkg.popular
                      ? "bg-white ring-2 ring-red-600 shadow-2xl"
                      : "bg-white border border-slate-100 shadow-sm hover:shadow-xl"
                  )}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span
                        className="rounded-full text-white text-[11px] font-bold px-3.5 py-1 tracking-wide shadow-lg"
                        style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)" }}
                      >
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h3 className="text-xl font-bold font-mono text-slate-900">{pkg.name}</h3>
                      <span className="text-xs font-mono text-slate-400">{pkg.credits}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className={cn("text-4xl font-extrabold font-mono", pkg.popular ? "text-red-600" : "text-slate-900")}>
                        {pkg.price}
                      </span>
                    </div>

                    <div className="mb-6 h-px bg-slate-100" />

                    <ul className="space-y-2.5">
                      {pkg.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7">
                    <Link
                      to="/register"
                      className={cn(
                        "w-full flex items-center justify-center rounded-xl py-3 text-xs font-bold tracking-widest font-mono transition-all hover:scale-[1.02] active:scale-[0.98]",
                        pkg.popular
                          ? "text-white shadow-lg"
                          : "text-red-600 bg-red-50 hover:bg-red-100"
                      )}
                      style={pkg.popular ? { background: "linear-gradient(135deg, #E41827, #B00D1A)", boxShadow: "0 8px 24px rgba(228,24,39,0.25)" } : {}}
                    >
                      SELECT {pkg.name.toUpperCase()}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line" />

        {/* ── FAQ ── */}
        <section id="faq" className="bg-[#F8F9FB] py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10">
              <span className="text-xs font-bold tracking-widest text-emerald-600 font-mono uppercase inline-flex items-center gap-1.5 mb-3">
                <Eye className="size-3.5" />
                FREQUENTLY ASKED
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Questions & Intel
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f) => (
                <AccordionItem
                  key={f.q}
                  value={f.q}
                  className="bg-white rounded-xl border border-slate-100 px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-bold font-mono py-5 hover:no-underline text-slate-900 hover:text-red-600 transition-colors">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed pb-5 text-slate-500">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
