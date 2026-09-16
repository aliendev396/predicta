import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  Coins,
  Handshake,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoFull, LogoSymbol } from "@/components/brand/Logo";
import { profileQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "New Scan", icon: ScanSearch },
  { to: "/history", label: "History", icon: History },
  { to: "/credits", label: "Credits & Tiers", icon: Coins },
  { to: "/partner", label: "Partner Hub", icon: Handshake },
] as const;

export function AppShell({
  userId,
  isAdmin = false,
  isPartner = false,
  children,
}: {
  userId: string;
  isAdmin?: boolean;
  isPartner?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [, setIsOffline] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online — syncing latest data…");
      void queryClient.invalidateQueries();
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You are currently offline. Check your network connection.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  const { data: profile } = useQuery(profileQuery(userId));
  const partnerOnly = isPartner && !isAdmin;

  const nav = partnerOnly
    ? ([{ to: "/partner", label: "Partner Hub", icon: Handshake }] as const)
    : [
        ...baseNav.filter((item) => item.to !== "/partner"),
        ...(isAdmin ? ([{ to: "/partner", label: "Partner", icon: Handshake }] as const) : []),
        ...(isAdmin ? ([{ to: "/admin", label: "Admin Console", icon: ShieldCheck }] as const) : []),
      ];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  // Auto-close mobile drawer whenever navigation completes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navList = (
    <nav className="flex flex-col gap-1.5" aria-label="Workspace">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3.5 rounded-full px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 select-none touch-manipulation",
              active
                ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50/50 text-slate-950 font-sans selection:bg-red-600 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex z-30 shadow-2xs">
        <Link to="/" aria-label="PREDICTA home" className="px-2">
          <LogoFull className="h-7 w-auto object-contain" />
        </Link>

        {/* Live Engine Status Badge */}
        <div className="mt-4 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold uppercase tracking-widest border border-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>ALGORITHM V4.2 LIVE</span>
          </div>
        </div>

        <div className="mt-8 flex-1">{navList}</div>

        {/* Sidebar Credit Card */}
        {!partnerOnly && (
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 text-white shadow-lg space-y-3 relative overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-red-600/15 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                VAULT BALANCE
              </span>
              <Coins className="size-4 text-red-500" />
            </div>
            <p className="text-4xl font-black tracking-tight text-white font-sans">
              {profile?.credits ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Match scan credits active
            </p>
            <Button
              asChild
              size="sm"
              className="w-full rounded-full bg-red-600 hover:bg-white hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/25 border-0 transition-all cursor-pointer"
            >
              <Link to="/credits" className="flex items-center justify-center gap-1.5">
                Top Up Vault
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <Link to="/" aria-label="PREDICTA home">
          <LogoSymbol className="h-8" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-slate-900 text-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1">
            {partnerOnly ? "Partner" : `${profile?.credits ?? 0} CREDITS`}
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-full text-slate-950 hover:bg-slate-100 touch-manipulation cursor-pointer"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          />
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-200 bg-white px-5 py-6 shadow-2xl lg:hidden space-y-4">
            {navList}
            <button
              type="button"
              onClick={signOut}
              className="mt-4 flex w-full items-center gap-3 rounded-full px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-950 touch-manipulation cursor-pointer"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="w-full min-w-0 max-w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:ml-64 lg:px-12 lg:py-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  badgeText = "PREDICTA ENGINE",
}: {
  title: string;
  description?: string;
  badgeText?: string;
}) {
  return (
    <header className="mb-8 space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-[10px] font-bold tracking-widest uppercase shadow-2xs">
        <Sparkles className="size-3" />
        {badgeText}
      </div>
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 uppercase break-words">
        {title}
      </h1>
      {description && (
        <p className="text-slate-600 text-sm max-w-2xl font-normal leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}



