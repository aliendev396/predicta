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
  WifiOff,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoFull, LogoSymbol } from "@/components/brand/Logo";
import { profileQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "New Analysis", icon: ScanSearch },
  { to: "/history", label: "History", icon: History },
  { to: "/credits", label: "Credits", icon: Coins },
  { to: "/partner", label: "Partner", icon: Handshake },
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
  const [isOffline, setIsOffline] = useState(false);
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
        ...(isAdmin ? ([{ to: "/admin", label: "Admin", icon: ShieldCheck }] as const) : []),
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
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200",
              "touch-manipulation select-none active:scale-[0.98]",
              active
                ? "bg-white/[0.08] text-white border border-white/10 font-semibold shadow-xs"
                : "text-neutral-400 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <item.icon className={cn("size-4 shrink-0", active ? "text-[#2997FF]" : "text-neutral-400")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F7]">
      {/* macOS Sequoia styled Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/[0.08] bg-[#0A0A0E] px-4 py-5 lg:flex">
        <Link to="/" aria-label="PREDICTA home" className="inline-block px-1 py-1 transition-opacity hover:opacity-85">
          <LogoFull className="h-7 w-auto object-contain" />
        </Link>
        <div className="mt-8 flex-1">{navList}</div>

        {!partnerOnly && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md">
            <p className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
              Credit Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-white tracking-tight">{profile?.credits ?? 0}</p>
            <Link
              to="/credits"
              className="mt-3 flex items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold py-2 w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Top Up Credits
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>

      {/* Apple-styled Mobile Top Header */}
      <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-white/[0.08] bg-[#060608]/85 px-4 backdrop-blur-2xl lg:hidden">
        <Link to="/" aria-label="PREDICTA home" className="flex items-center">
          <LogoFull className="h-6.5 sm:h-7 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white">
            {partnerOnly ? "Partner" : `${profile?.credits ?? 0} credits`}
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-full text-white hover:bg-white/[0.08] touch-manipulation transition-colors"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 sm:top-16 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          />
          <div className="fixed inset-x-0 top-14 sm:top-16 z-50 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-white/[0.08] bg-[#0A0A0E] px-5 py-5 shadow-2xl lg:hidden">
            {navList}
            <button
              type="button"
              onClick={signOut}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-400 hover:bg-white/[0.04] hover:text-white touch-manipulation"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </>
      )}

      <main className="px-4 py-6 sm:px-8 lg:ml-64 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8 sm:mb-10 text-left">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-2 text-sm sm:text-base text-neutral-400 font-normal">{description}</p>}
    </header>
  );
}
