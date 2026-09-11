import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ScanSearch,
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
import { FloatingParticles } from "@/components/site/FloatingParticles";
import { GlitchText } from "@/components/site/GlitchText";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { cn } from "@/lib/utils";

const symbolLogo = "/predicta-symbol.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PREDICTA â€” Instant Virtuals Outcome Exposed" },
      {
        name: "description",
        content:
          "PREDICTA exposes the next SportyBet instant virtual outcome before the game loads. Upload your screenshot, hack the result, play with certainty.",
      },
      { property: "og:title", content: "PREDICTA â€” Instant Virtuals Outcome Exposed" },
      {
        property: "og:description",
        content:
          "Our algorithm penetrates the SportyBet instant virtual engine and delivers the next outcome â€” no guesswork, just exposed results.",
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
            { name: "Starter", description: "2 scan credits, 2 outcomes per screenshot.", price: "250" },
            { name: "Plus", description: "3 scan credits, 4 outcomes per screenshot.", price: "350" },
            { name: "Premium", description: "5 scan credits, 8 outcomes per screenshot.", price: "500" },
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
    body: "Our proprietary breach engine decodes each virtual match frame with machine-level accuracy. Results are locked â€” zero second-guessing.",
    accent: "rgba(228,24,39,0.12)",
    iconColor: "text-red-400",
  },
  {
    icon: Trophy,
    title: "Proven Strikes",
    body: "Thousands of users have already exposed outcomes daily. Numbers don't lie â€” our track record proves it.",
    accent: "rgba(251,191,36,0.10)",
    iconColor: "text-amber-400",
  },
  {
    icon: ShieldCheck,
    title: "Zero Traces",
    body: "All breach operations are encrypted end-to-end. Your account, uploads, and exposed outcomes leave no trail.",
    accent: "rgba(16,185,129,0.10)",
    iconColor: "text-emerald-400",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    body: "Upload your screenshot. Our system penetrates the virtual feed and returns the exposed outcome in seconds.",
    accent: "rgba(96,165,250,0.10)",
    iconColor: "text-blue-400",
  },
];

const steps = [
  {
    n: "01",
    title: "Upload",
    body: "Drop your SportyBet instant virtual screenshot â€” PNG, JPG or WEBP. Our system reads the game identifier.",
    color: "rgba(228,24,39,0.15)",
    borderColor: "rgba(228,24,39,0.30)",
  },
  {
    n: "02",
    title: "Penetrate",
    body: "The algorithm breaches the virtual engine feed, cross-references the match ID, and locks the next outcome.",
    color: "rgba(16,185,129,0.10)",
    borderColor: "rgba(16,185,129,0.25)",
  },
  {
    n: "03",
    title: "Expose",
    body: "Receive your certified outcome â€” confirmed before the game loads. Bet with certainty, not chance.",
    color: "rgba(228,24,39,0.12)",
    borderColor: "rgba(228,24,39,0.25)",
  },
];

const packages = [
  {
    name: "Starter",
    price: "GHâ‚µ250",
    credits: "2 outcomes per screenshot",
    perks: ["2 scan credits", "Instant Virtual Football only", "Outcome history", "Email support"],
    popular: false,
    badge: null,
  },
  {
    name: "Plus",
    price: "GHâ‚µ350",
    credits: "4 outcomes per screenshot",
    perks: ["3 scan credits", "Instant Virtual Football only", "Outcome history", "Priority email support"],
    popular: false,
    badge: "ðŸ”¥ Best Value",
  },
  {
    name: "Premium",
    price: "GHâ‚µ500",
    credits: "8 outcomes per screenshot",
    perks: ["5 scan credits", "Instant Virtual Football only", "Outcome history", "Priority support"],
    popular: true,
    badge: "âš¡ Most Popular",
  },
];

const trust = [
  { icon: Lock, title: "Fully encrypted", body: "Every breach operation runs over 256-bit encrypted tunnels. Nothing leaks." },
  { icon: ShieldCheck, title: "Verified outcomes", body: "Every exposed result passes through our multi-layer verification engine." },
  { icon: TrendingUp, title: "Consistent delivery", body: "Tens of thousands of outcomes delivered with zero downtime." },
  { icon: Receipt, title: "Transparent pricing", body: "Clear credit packages, visible history â€” no hidden fees, ever." },
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
    a: "Yes. Every completed exposure is saved to your history with its ID, date, image and status â€” and can be reopened or downloaded at any time.",
  },
];

/* â”€â”€ Logo watermark background â”€â”€ */
function LogoWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.018]" aria-hidden="true">
      <div className="absolute inset-0 animate-logo-drift" style={{ transformOrigin: "center center" }}>
        {Array.from({ length: 30 }, (_, i) => (
          <img
            key={i}
            src={symbolLogo}
            alt=""
            className="absolute h-16 w-16 select-none brightness-0 invert"
            style={{
              left: `${(i * 19 + 5) % 95}%`,
              top: `${(i * 23 + 8) % 90}%`,
              transform: `rotate(${(i * 37) % 360}deg)`,
              animationDelay: `${(i * 0.3) % 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* â”€â”€ Terminal hack card (right column) â”€â”€ */
function TerminalHackCard() {
  const outcomes = [
    { game: "SPBET-VIRT #3291", match: "Lions FC vs Eagles Utd", result: "HOME WIN", odds: "1.85", status: "EXPOSED" },
    { game: "SPBET-VIRT #3292", match: "Storm City vs Thunder FC", result: "OVER 2.5 GOALS", odds: "1.72", status: "EXPOSED" },
    { game: "SPBET-VIRT #3293", match: "Phoenix FC vs Red Devils", result: "BTTS â€” YES", odds: "1.90", status: "EXPOSED" },
  ];

  return (
    <div
      className="rounded-2xl p-4 sm:p-6 relative overflow-hidden font-mono"
      style={{
        background: "rgba(10, 3, 7, 0.90)",
        border: "1px solid rgba(228, 24, 39, 0.35)",
        boxShadow: "0 0 0 1px rgba(228,24,39,0.08), 0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(228,24,39,0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Scan line */}
      <div className="animate-scan-line" />

      {/* Shine sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 w-[25%] animate-shine"
          style={{ background: "linear-gradient(90deg, transparent, rgba(228,24,39,0.06), transparent)" }}
        />
      </div>

      {/* Red ambient glow top-right */}
      <div className="pointer-events-none absolute -top-8 -right-8 size-40 rounded-full blur-2xl opacity-30"
        style={{ background: "radial-gradient(circle, rgba(228,24,39,0.4), transparent 70%)" }} />

      {/* Terminal header */}
      <div
        className="flex items-center gap-1.5 mb-4 pb-3 min-w-0"
        style={{ borderBottom: "1px solid rgba(228,24,39,0.15)" }}
      >
        <span className="size-2.5 shrink-0 rounded-full bg-red-500" />
        <span className="size-2.5 shrink-0 rounded-full bg-yellow-500" />
        <span className="size-2.5 shrink-0 rounded-full bg-emerald-500" />
        <span className="ml-2 text-[9px] sm:text-[10px] tracking-wider truncate flex-1 min-w-0 text-emerald-400 font-mono">
          root@predicta:~$ ./breach_sportybet.sh
        </span>
        <span className="shrink-0 inline-block w-1.5 h-3 bg-emerald-400 animate-terminal-cursor" />
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500 animate-status-blink" />
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-emerald-400">
            BREACH ACTIVE
          </span>
        </div>
        <Badge
          className="text-[9px] sm:text-[10px] gap-1 font-mono shrink-0"
          style={{ background: "rgba(228,24,39,0.15)", border: "1px solid rgba(228,24,39,0.40)", color: "#f87171" }}
        >
          <AlertTriangle className="size-3" />
          3 OUTCOMES EXPOSED
        </Badge>
      </div>

      {/* Outcome rows */}
      <div className="space-y-2 sm:space-y-2.5">
        {outcomes.map((v, i) => (
          <div
            key={v.game}
            className="rounded-xl p-2.5 sm:p-3 transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(228,24,39,0.12)",
              animation: `slide-up-fade 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.15}s both`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(228,24,39,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(228,24,39,0.12)")}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] tracking-wider truncate text-neutral-500">
                  {v.game} Â· {v.match}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-white">{v.result}</p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] sm:text-[10px] font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}
                >
                  <Check className="size-2.5" />
                  {v.status}
                </span>
                <p className="mt-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">@{v.odds}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div
        className="mt-4 rounded-xl p-2.5 sm:p-3"
        style={{ background: "rgba(228,24,39,0.07)", border: "1px solid rgba(228,24,39,0.20)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-red-400">
            <Cpu className="size-3.5 shrink-0" />
            <span className="truncate">SYSTEM ACCESS: GRANTED</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold shrink-0 text-emerald-400">âœ“ EXPOSED</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(228,24,39,0.15)" }}>
          <div className="h-full rounded-full animate-hack-bar" style={{ background: "linear-gradient(90deg, #E41827, #10b981)" }} />
        </div>
        <p className="mt-1.5 text-[9px] sm:text-[10px]" style={{ color: "rgba(240,240,240,0.4)" }}>
          Next breach cycle: <span className="text-emerald-400">00:03:47</span>
        </p>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#0A0208", color: "#F0F0F0" }}>
      {/* Global logo watermark */}
      <LogoWatermark />

      <SiteNavbar />
      <LiveTicker />

      <main className="relative">
        {/* â”€â”€ HERO â”€â”€ */}
        <section id="overview" className="relative overflow-hidden">
          {/* Red ambient top glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(228,24,39,0.22) 0%, transparent 65%)" }}
          />
          {/* Green bottom-left ambient */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 40% 35% at 5% 95%, rgba(16,185,129,0.07) 0%, transparent 70%)" }}
          />

          <FloatingParticles />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 sm:gap-14 px-4 py-14 sm:py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
            {/* Left column */}
            <div className="animate-rise relative">
              {/* Breach badge */}
              <div className="mb-5 sm:mb-6">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest"
                  style={{ border: "1px solid rgba(228,24,39,0.40)", background: "rgba(228,24,39,0.10)", color: "#f87171" }}
                >
                  <span className="size-2 rounded-full bg-red-500 animate-status-blink" />
                  SYSTEM BREACH ACTIVE
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl leading-[1.12]" style={{ color: "#F0F0F0" }}>
                Instant Virtuals.{" "}
                <GlitchText className="text-primary">
                  Outcome Exposed.
                </GlitchText>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg font-medium" style={{ color: "rgba(240,240,240,0.60)" }}>
                Our proprietary algorithm penetrates the{" "}
                <span className="font-bold text-emerald-400">
                  SportyBet instant virtual engine
                </span>{" "}
                â€” delivering the next match outcome before the game even loads. No guesswork. Just exposed results.
              </p>

              <div className="mt-7 sm:mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="relative overflow-hidden group font-mono font-bold tracking-widest text-white shadow-xl"
                  style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", border: "1px solid rgba(228,24,39,0.5)", boxShadow: "0 8px 28px rgba(228,24,39,0.28)" }}
                  asChild
                >
                  <Link to="/register">
                    <span className="relative z-10 flex items-center gap-2">
                      HACK THE OUTCOME{" "}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="absolute inset-0 animate-shine opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="font-mono font-bold"
                  style={{ border: "1px solid rgba(16,185,129,0.40)", color: "#6ee7b7", background: "rgba(16,185,129,0.06)" }}
                >
                  <a href="#how-it-works">
                    <Terminal className="mr-2 size-4 text-emerald-400" />
                    ENTER THE SYSTEM
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <dl
                className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-6 pt-6"
                style={{ borderTop: "1px solid rgba(228,24,39,0.15)" }}
              >
                {[
                  { value: 99, suffix: "%", label: "Accuracy rate" },
                  { value: 14, suffix: "K+", label: "Exposed" },
                ].map(({ value, suffix, label }) => (
                  <div key={label}>
                    <dt className="text-xl sm:text-2xl font-extrabold font-mono" style={{ color: "#F0F0F0" }}>
                      <AnimatedCounter end={value} suffix={suffix} className="tabular-nums" />
                    </dt>
                    <dd className="text-[11px] sm:text-xs font-mono font-semibold mt-0.5" style={{ color: "rgba(240,240,240,0.45)" }}>
                      {label}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="flex items-center gap-1.5 text-xl sm:text-2xl font-extrabold font-mono" style={{ color: "#F0F0F0" }}>
                    <span className="size-2.5 shrink-0 rounded-full bg-emerald-500 animate-status-blink" />
                    24/7
                  </dt>
                  <dd className="text-[11px] sm:text-xs font-mono font-semibold mt-0.5" style={{ color: "rgba(240,240,240,0.45)" }}>
                    Always live
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right column â€” terminal card */}
            <div className="animate-rise" style={{ animationDelay: "0.15s" }}>
              <TerminalHackCard />
            </div>
          </div>
        </section>

        {/* â”€â”€ SECTION DIVIDER â”€â”€ */}
        <div className="section-line" />

        {/* â”€â”€ FEATURES â”€â”€ */}
        <section id="features" className="relative px-4 py-16 sm:px-6 lg:py-24" style={{ background: "rgba(6,2,5,0.60)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl mb-10 sm:mb-12">
              <span className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest" style={{ color: "rgba(228,24,39,0.85)" }}>
                <Activity className="size-3.5" />
                WHY OUR ALGORITHM NEVER FAILS
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: "#F0F0F0" }}>
                Built to Expose, Not Guess
              </h2>
              <p className="mt-3 font-medium" style={{ color: "rgba(240,240,240,0.50)" }}>
                Every component is engineered to deliver certainty â€” not predictions.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="group rounded-2xl p-5 sm:p-6 cursor-default transition-all duration-300 hover:-translate-y-1.5"
                  style={{
                    background: "rgba(15, 5, 12, 0.80)",
                    border: "1px solid rgba(228,24,39,0.15)",
                    animationDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(228,24,39,0.35)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.5), 0 0 20px rgba(228,24,39,0.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(228,24,39,0.15)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <span
                    className="inline-flex size-11 items-center justify-center rounded-xl mb-4 transition-all duration-300"
                    style={{ background: f.accent, border: `1px solid ${f.accent.replace("0.12","0.25").replace("0.10","0.20")}` }}
                  >
                    <f.icon className={cn("size-5", f.iconColor)} />
                  </span>
                  <h3 className="text-base font-bold font-mono" style={{ color: "#F0F0F0" }}>{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(240,240,240,0.50)" }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line" />

        {/* â”€â”€ HOW IT WORKS â”€â”€ */}
        <section id="how-it-works" className="relative" style={{ background: "rgba(10,3,8,0.90)" }}>
          <FloatingParticles />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 lg:py-28">
            <div className="max-w-2xl mb-12">
              <span className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-emerald-500">
                <Wifi className="size-3.5" />
                BREACH PROTOCOL
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: "#F0F0F0" }}>
                How The System Works
              </h2>
              <p className="mt-3 font-medium" style={{ color: "rgba(240,240,240,0.50)" }}>
                Three steps from screenshot to exposed instant virtual outcome.
              </p>
            </div>

            <ol className="grid gap-5 sm:gap-6 sm:grid-cols-3">
              {steps.map((s, idx) => (
                <li
                  key={s.n}
                  className="group rounded-2xl p-6 sm:p-7 transition-all duration-300 cursor-default relative overflow-hidden hover:-translate-y-1"
                  style={{ background: "rgba(15,5,12,0.85)", border: `1px solid ${s.borderColor}` }}
                >
                  {/* step number large bg */}
                  <div
                    className="pointer-events-none absolute -right-4 -bottom-4 text-[96px] font-black font-mono leading-none select-none transition-opacity duration-300 opacity-[0.04] group-hover:opacity-[0.08]"
                    style={{ color: "#E41827" }}
                  >
                    {s.n}
                  </div>

                  <span
                    className="inline-flex size-11 items-center justify-center rounded-xl text-sm font-extrabold tracking-widest font-mono mb-4"
                    style={{ background: s.color, border: `1px solid ${s.borderColor}`, color: idx === 1 ? "#6ee7b7" : "#f87171" }}
                  >
                    {s.n}
                  </span>
                  <h3 className="text-lg font-bold font-mono" style={{ color: "#F0F0F0" }}>{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(240,240,240,0.52)" }}>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="section-line" />

        {/* â”€â”€ TRUST â”€â”€ */}
        <section className="relative" style={{ background: "rgba(8,2,6,0.95)" }}>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest" style={{ color: "rgba(228,24,39,0.85)" }}>
                <Database className="size-3.5" />
                OPERATIONAL INTEGRITY
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: "#F0F0F0" }}>
                Built on Trust, Hardened by Design
              </h2>
              <p className="mt-3 font-medium text-sm sm:text-base" style={{ color: "rgba(240,240,240,0.50)" }}>
                Every layer of PREDICTA is engineered for security, reliability, and transparency.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((t, idx) => {
                const accents = [
                  { bar: "#E41827", iconBg: "rgba(228,24,39,0.12)", iconText: "text-red-400" },
                  { bar: "#10b981", iconBg: "rgba(16,185,129,0.10)", iconText: "text-emerald-400" },
                  { bar: "#3b82f6", iconBg: "rgba(59,130,246,0.10)", iconText: "text-blue-400" },
                  { bar: "#f59e0b", iconBg: "rgba(245,158,11,0.10)", iconText: "text-amber-400" },
                ];
                const accent = accents[idx % accents.length]!;
                return (
                  <div
                    key={t.title}
                    className="group relative rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-default overflow-hidden"
                    style={{ background: "rgba(15,5,12,0.85)", border: "1px solid rgba(228,24,39,0.12)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(228,24,39,0.28)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(228,24,39,0.12)"; }}
                  >
                    {/* Top color bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: accent.bar }} />

                    <span
                      className="inline-flex size-11 items-center justify-center rounded-xl mb-4"
                      style={{ background: accent.iconBg }}
                    >
                      <t.icon className={cn("size-5", accent.iconText)} />
                    </span>
                    <h3 className="text-sm font-bold font-mono" style={{ color: "#F0F0F0" }}>{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(240,240,240,0.50)" }}>{t.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="section-line" />

        {/* â”€â”€ PACKAGES â”€â”€ */}
        <section id="packages" className="relative px-4 py-16 sm:px-6 lg:py-24" style={{ background: "rgba(10,3,8,0.90)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest" style={{ color: "rgba(228,24,39,0.85)" }}>
                <ScanSearch className="size-3.5" />
                CREDIT PACKAGES
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: "#F0F0F0" }}>
                Choose Your Intel Tier
              </h2>
              <p className="mt-3 font-medium" style={{ color: "rgba(240,240,240,0.50)" }}>
                One credit = one screenshot scan = one exposed outcome.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative"
                  style={pkg.popular ? {
                    background: "rgba(20,6,14,0.95)",
                    border: "2px solid rgba(228,24,39,0.60)",
                    boxShadow: "0 0 0 1px rgba(228,24,39,0.12), 0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(228,24,39,0.12)",
                  } : {
                    background: "rgba(15,5,12,0.85)",
                    border: "1px solid rgba(228,24,39,0.15)",
                  }}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span
                        className="rounded-full text-white text-[11px] font-bold px-3.5 py-1 tracking-wide shadow-lg"
                        style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", border: "1px solid rgba(228,24,39,0.5)" }}
                      >
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-xl font-bold font-mono" style={{ color: "#F0F0F0" }}>{pkg.name}</h3>
                      <span className="text-xs font-mono" style={{ color: "rgba(240,240,240,0.40)" }}>{pkg.credits}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono" style={{ color: pkg.popular ? "#f87171" : "#F0F0F0" }}>
                        {pkg.price}
                      </span>
                    </div>

                    <div className="mb-6" style={{ height: "1px", background: "rgba(228,24,39,0.12)" }} />

                    <ul className="space-y-2.5">
                      {pkg.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(240,240,240,0.65)" }}>
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center rounded-xl py-3 text-xs font-bold tracking-widest font-mono transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={pkg.popular ? {
                        background: "linear-gradient(135deg, #E41827, #B00D1A)",
                        border: "1px solid rgba(228,24,39,0.5)",
                        color: "#fff",
                        boxShadow: "0 8px 24px rgba(228,24,39,0.25)",
                      } : {
                        background: "rgba(228,24,39,0.10)",
                        border: "1px solid rgba(228,24,39,0.30)",
                        color: "#f87171",
                      }}
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

        {/* â”€â”€ FAQ â”€â”€ */}
        <section id="faq" className="relative px-4 py-16 sm:px-6 lg:py-24" style={{ background: "rgba(8,2,6,0.95)" }}>
          <div className="mx-auto max-w-3xl">
            <div className="mb-10">
              <span className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-emerald-500">
                <Eye className="size-3.5" />
                FREQUENTLY ASKED
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: "#F0F0F0" }}>
                Questions & Intel
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f) => (
                <AccordionItem
                  key={f.q}
                  value={f.q}
                  className="rounded-xl px-5 sm:px-6 transition-colors"
                  style={{ border: "1px solid rgba(228,24,39,0.15)", background: "rgba(15,5,12,0.85)" }}
                >
                  <AccordionTrigger
                    className="text-left text-sm sm:text-base font-bold font-mono py-4 hover:no-underline"
                    style={{ color: "#F0F0F0" }}
                  >
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed pb-5" style={{ color: "rgba(240,240,240,0.55)" }}>
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* â”€â”€ CTA BANNER â”€â”€ */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #8B0913 0%, #E41827 40%, #C50F1F 70%, #6B0710 100%)" }}
        >
          {/* Noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
          />
          <FloatingParticles />

          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20 text-center sm:px-6">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[10px] sm:text-xs font-bold tracking-widest text-white"
              style={{ border: "1px solid rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.12)" }}
            >
              <span className="size-2 shrink-0 rounded-full bg-emerald-400 animate-status-blink" />
              SYSTEM ONLINE â€” READY TO BREACH
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-5xl text-white">
              Ready to Expose Your First Instant Virtual?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/85 font-medium">
              Create your PREDICTA account and start receiving exposed instant virtual outcomes in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Button
                size="lg"
                className="group font-mono font-bold tracking-widest text-primary shadow-2xl hover:scale-[1.03] transition-transform"
                style={{ background: "#fff", color: "#B00D1A" }}
                asChild
              >
                <Link to="/register">
                  HACK THE OUTCOME{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 ml-2" />
                </Link>
              </Button>
              <Link
                to="/login"
                className="text-sm font-semibold text-white/80 hover:text-white transition-colors underline underline-offset-4"
              >
                Already a member? Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}


