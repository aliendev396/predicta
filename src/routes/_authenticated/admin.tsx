import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/AppShell";
import { LogoSymbol } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { adjustMemberSpent, deleteMember, explodePlatformData, updatePaymentSettings } from "@/lib/admin.functions";
import {
  cleanDisplayValue,
  displayEmailOrPhone,
  displayUserName,
  isSyntheticPhoneEmail,
  extractPhoneFromSyntheticEmail,
} from "@/lib/phone";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Flame,
  Layers,
  Lock,
  Mail,
  Pencil,
  Percent,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  adminDailyCommissionSnapshotsQuery,
  adminMemberListQuery,
  adminPackagesQuery,
  adminPartnerApplicationsQuery,
  adminPartnerListQuery,
  adminPartnerPayoutsQuery,
  adminPaymentsQuery,
  adminStatsQuery,
  auditLogsQuery,
  ghs,
  paymentSettingsQuery,
  packagesQuery,
  rolesQuery,
  type AdminApplicationRow,
  type AdminPartnerRow,
  type DailyCommissionSnapshot,
  type PackageRow,
  type PartnerPayoutRow,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — PREDICTA" },
      { name: "description", content: "Platform command center for PREDICTA: verify payments, adjust commissions, govern partners and monitor platform health." },
      { property: "og:title", content: "Admin Console — PREDICTA" },
      { property: "og:description", content: "Approve payments and govern the PREDICTA AI platform." },
    ],
  }),
  component: AdminPage,
});

/**
 * Realtime WebSockets hook for the Admin Console:
 * Instant updates for payments, members, partners, and revenue stats without reloading.
 */
function useAdminRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("admin-realtime-websocket")
      .on(
        "broadcast",
        { event: "payment-submitted" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-partner-payouts"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-daily-commission-snapshots"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-partner-payouts"] });
          void queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-daily-commission-snapshots"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_settings" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-daily-commission-snapshots"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_applications" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["admin-partner-applications"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_commissions" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["admin-partner-payouts"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

function AdminPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: roles, isLoading: rolesLoading } = useQuery(rolesQuery(user.id));
  const isAdmin = (roles ?? []).includes("admin");

  // Subscribe to real-time WebSockets when admin access is granted
  useAdminRealtime(isAdmin);

  const { data: stats } = useQuery({
    ...adminStatsQuery(),
    enabled: isAdmin,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const { data: payments } = useQuery({
    ...adminPaymentsQuery(),
    enabled: isAdmin,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
  const { data: members } = useQuery({
    ...adminMemberListQuery({}),
    enabled: isAdmin,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const { data: applications } = useQuery({
    ...adminPartnerApplicationsQuery(),
    enabled: isAdmin,
    staleTime: 30_000,
  });
  const { data: logs } = useQuery({ ...auditLogsQuery(), enabled: isAdmin, staleTime: 30_000 });
  const { data: settings } = useQuery({ ...paymentSettingsQuery(), enabled: isAdmin, staleTime: 60_000 });
  const { data: snapshots } = useQuery({
    ...adminDailyCommissionSnapshotsQuery(),
    enabled: isAdmin,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const snapshotMap = useMemo(() => {
    const map = new Map<string, DailyCommissionSnapshot>();
    for (const s of snapshots ?? []) {
      const dateKey = typeof s.date === "string" ? s.date.slice(0, 10) : "";
      if (dateKey) map.set(dateKey, s);
    }
    return map;
  }, [snapshots]);

  const reviewPayment = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase.rpc("review_payment", {
        _payment_id: id,
        _approve: approve,
        _note: approve ? "Payment verified" : "Reference could not be verified",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-payments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-members"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-partner-payouts"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-daily-commission-snapshots"] }),
      ]);
      toast.success("Payment review submitted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Revenue history calendar state ──
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute which date to show revenue for (selected or today)
  const activeDate = selectedHistoryDate;
  const activeDateStr = activeDate
    ? `${activeDate.getFullYear()}-${String(activeDate.getMonth() + 1).padStart(2, "0")}-${String(activeDate.getDate()).padStart(2, "0")}`
    : todayStr;
  const isHistoryMode = selectedHistoryDate !== null;
  const isPastLockedDate = isHistoryMode && activeDateStr < todayStr;

  const activeRevenue = (payments ?? [])
    .filter((p) => p.status === "approved" && (p.created_at || "").slice(0, 10) === activeDateStr)
    .reduce((acc, p) => acc + Number(p.amount_ghs || 0), 0);

  const selectedSnapshot = snapshotMap.get(activeDateStr);

  const devRate = isPastLockedDate && selectedSnapshot
    ? Number(selectedSnapshot.developer_commission_rate)
    : Number(settings?.developer_commission_rate ?? 15);
  const devCommission = (activeRevenue * devRate) / 100;

  const adminRate = isPastLockedDate && selectedSnapshot
    ? Number(selectedSnapshot.admin_commission_rate)
    : Number(settings?.admin_commission_rate ?? 15);
  const adminCommission = (activeRevenue * adminRate) / 100;

  // Days that have approved revenue (for calendar indicators)
  const revenueDays = useMemo(() => {
    const days = new Set<string>();
    for (const p of payments ?? []) {
      if (p.status === "approved" && p.created_at) {
        days.add(p.created_at.slice(0, 10));
      }
    }
    return Array.from(days).map((d) => new Date(d + "T00:00:00"));
  }, [payments]);

  const totalAcceptedRevenue = useMemo(() => {
    const statsRev = Number(stats?.revenue_ghs ?? 0);
    const paymentsRev = (payments ?? [])
      .filter((p) => p.status === "approved")
      .reduce((acc, p) => acc + Number(p.amount_ghs || 0), 0);
    return Math.max(statsRev, paymentsRev);
  }, [stats?.revenue_ghs, payments]);

  const activeDateLabel = activeDate
    ? activeDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "Today";

  const pendingPaymentsCount = (payments ?? []).filter((p) => p.status === "pending").length;
  const pendingAppsCount = (applications ?? []).filter((a) => a.status === "pending").length;

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Authenticating admin privileges…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <PageHeader
        badgeText="ACCESS RESTRICTED"
        title="Admin only"
        description="You don't have authorization permissions to view the PREDICTA command center."
      />
    );
  }

  return (
    <div className="space-y-8 pb-16 selection:bg-red-600 selection:text-white">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200/80 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-red-600">
              <ShieldCheck className="size-3 text-red-600" /> PREDICTA COMMAND CENTER
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE SYNC
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 font-sans">
            ADMIN CONSOLE
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
            Verify member payments, calibrate commission splits, audit platform operations, and manage monetization.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pendingPaymentsCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-pulse">
              <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
              <span><strong>{pendingPaymentsCount}</strong> payment{pendingPaymentsCount === 1 ? "" : "s"} awaiting approval</span>
            </div>
          )}
        </div>
      </div>

      {/* Bento-Style Stat Overview Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
        <Stat
          label="Total Revenue"
          value={ghs(totalAcceptedRevenue)}
          highlight
          subtext="Total ever accepted"
          icon={Wallet}
        />
        <Stat
          label={isHistoryMode ? `Revenue · ${activeDateLabel}` : "Today's Revenue"}
          value={ghs(activeRevenue)}
          highlight
          subtext={isHistoryMode ? `Historical snapshot` : `Live daily tally`}
          icon={CreditCard}
          action={
            <div className="flex items-center gap-1">
              {isHistoryMode && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedHistoryDate(null); }}
                  className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
                  aria-label="Back to today"
                >
                  <X className="size-2.5" />
                  Today
                </button>
              )}
              <RevenueHistoryCalendar
                open={calendarOpen}
                onOpenChange={setCalendarOpen}
                selected={selectedHistoryDate}
                onSelect={(day) => {
                  setSelectedHistoryDate(day ?? null);
                  setCalendarOpen(false);
                }}
                revenueDays={revenueDays}
                snapshotMap={snapshotMap}
              />
            </div>
          }
        />
        <Stat
          label={isHistoryMode ? `Dev (${devRate}%) · ${activeDateLabel}` : `Dev Split (${devRate}%)`}
          value={ghs(devCommission)}
          highlight
          subtext="System share"
          icon={Percent}
        />
        <Stat
          label={isHistoryMode ? `Admin (${adminRate}%) · ${activeDateLabel}` : `Admin Split (${adminRate}%)`}
          value={ghs(adminCommission)}
          highlight
          subtext="Platform share"
          icon={Percent}
        />
        <Stat
          label="Partners"
          value={String(stats?.partners ?? 0)}
          subtext="Affiliate network"
          icon={Users}
        />
        <Stat
          label="Members"
          value={String(stats?.members ?? 0)}
          subtext="Registered users"
          icon={ShieldCheck}
        />
        <Stat
          label="Analyses"
          value={String(stats?.analyses ?? 0)}
          subtext="AI scans run"
          icon={Activity}
        />
        <Stat
          label="Pending Queue"
          value={String(stats?.pending_payments ?? 0)}
          subtext={stats?.pending_payments ? "Action required" : "Queue clear"}
          alert={Number(stats?.pending_payments ?? 0) > 0}
          icon={Clock}
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="payments" className="min-h-[650px] space-y-6">
        <div className="sticky top-14 sm:top-16 lg:top-0 z-30 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="w-max min-w-full justify-start gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80">
              {[
                { value: "payments", label: "Payments Queue", badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null },
                { value: "settings", label: "Gateway & Splits" },
                { value: "packages", label: "Packages & Tiers" },
                { value: "partners", label: "Partner Payouts" },
                { value: "manage-partners", label: "Partner Approvals", badge: pendingAppsCount > 0 ? pendingAppsCount : null },
                { value: "members", label: "Member Vault" },
                { value: "audit", label: "Audit Logs" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-red-600/20 text-slate-600 hover:text-slate-950 border border-transparent touch-manipulation select-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="inline-flex size-4 items-center justify-center rounded-full bg-white text-red-600 text-[10px] font-black leading-none shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value="payments" className="min-h-[450px] focus-visible:outline-none">
          <PaymentsList payments={payments ?? []} members={(members ?? []) as MemberRow[]} reviewPayment={reviewPayment} />
        </TabsContent>

        <TabsContent value="settings" className="min-h-[450px] focus-visible:outline-none">
          <AdminSettingsManager />
        </TabsContent>

        <TabsContent value="packages" className="min-h-[450px] focus-visible:outline-none">
          <MonetisationManager />
        </TabsContent>

        <TabsContent value="partners" className="min-h-[450px] focus-visible:outline-none">
          <PartnerPayouts />
        </TabsContent>

        <TabsContent value="manage-partners" className="min-h-[450px] focus-visible:outline-none">
          <PartnerManager />
        </TabsContent>

        <TabsContent value="members" className="min-h-[450px] focus-visible:outline-none">
          <MembersList members={members ?? []} currentUserId={user.id} />
        </TabsContent>

        <TabsContent value="audit" className="min-h-[450px] space-y-6 focus-visible:outline-none">
          <ExplodeCard />
          <AuditLogList logs={logs ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type AuditLog = {
  id: string;
  action: string;
  actor_id: string | null;
  entity: string;
  entity_id: string | null;
  meta: unknown;
  created_at: string;
};

function RemoveMember({ userId, label }: { userId: string; label: string }) {
  const queryClient = useQueryClient();
  const removeFn = useServerFn(deleteMember);
  const remove = useMutation({
    mutationFn: async () => {
      const { data: rpcSuccess, error: rpcError } = await supabase.rpc("admin_delete_member" as never, {
        _user_id: userId,
      } as never);

      if (!rpcError && rpcSuccess) {
        return;
      }

      if (rpcError && rpcError.message && (
        rpcError.message.includes("FORBIDDEN") ||
        rpcError.message.includes("CANNOT_REMOVE_DEFAULT_ADMIN") ||
        rpcError.message.includes("CANNOT_REMOVE_SELF")
      )) {
        throw new Error(rpcError.message);
      }

      try {
        await removeFn({ data: { userId } });
      } catch (err: unknown) {
        if (rpcError) throw new Error(rpcError.message);
        throw err;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Member account removed");
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("FORBIDDEN")
          ? "Admins only"
          : e.message.includes("CANNOT_REMOVE_DEFAULT_ADMIN")
            ? "The default admin account cannot be removed"
            : e.message.includes("CANNOT_REMOVE_SELF")
              ? "You cannot remove your own admin account"
              : e.message,
      ),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          aria-label={`Delete ${label}`}
          className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 rounded-xl h-8 px-2.5 text-xs font-semibold"
        >
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl sm:rounded-3xl border-slate-200">
        <AlertDialogHeader>
          <div className="size-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-2">
            <Trash2 className="size-5" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-slate-950">Remove {label}?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
            This permanently deletes the member account and all associated analyses, payments, credits and history. To regain access, they must register again and complete payment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={remove.isPending}
            onClick={(e) => {
              e.preventDefault();
              remove.mutate();
            }}
            className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold"
          >
            {remove.isPending ? "Removing…" : "Remove member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Returns Badge className matching PREDICTA color language:
 *  emerald = approved/verified/granted  |  red = removed/deleted/exploded/reject  |  amber = updated/changed/pending  |  slate = everything else
 */
function actionBadgeClass(action: string): string {
  if (
    action.includes("removed") ||
    action.includes("deleted") ||
    action.includes("exploded") ||
    action.includes("reject")
  )
    return "bg-red-50 text-red-700 border border-red-200";
  if (
    action.includes("approved") ||
    action.includes("verified") ||
    action.includes("granted")
  )
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (
    action.includes("updated") ||
    action.includes("changed") ||
    action.includes("modified") ||
    action.includes("pending")
  )
    return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-100 text-slate-800 border border-slate-200";
}

function MetaTable({ meta }: { meta: unknown }) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const entries = Object.entries(meta as Record<string, unknown>);
  if (entries.length === 0) return null;
  return (
    <div className="mt-2 rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
      <table className="w-full">
        <tbody>
          {entries.map(([k, v]) => {
            let displayVal: string;
            if (typeof v === "object" && v !== null) {
              displayVal = JSON.stringify(v, null, 2);
            } else if (typeof v === "string") {
              displayVal = String(cleanDisplayValue(v) ?? "—");
            } else {
              displayVal = String(v ?? "—");
            }
            return (
              <tr key={k} className="border-t border-slate-800 first:border-t-0">
                <td className="py-1 pr-3 font-bold text-red-400 w-1/3 align-top">{k}</td>
                <td className="py-1 break-all text-slate-200">
                  {displayVal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AuditLogList({ logs }: { logs: AuditLog[] }) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        (l.entity_id ?? "").toLowerCase().includes(q) ||
        (l.actor_id ?? "").toLowerCase().includes(q) ||
        JSON.stringify(l.meta ?? {}).toLowerCase().includes(q),
    );
  }, [logs, search]);

  const visible = expanded ? filtered : filtered.slice(0, 15);

  const toggleRow = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Search + count row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, entity, ID, actor or metadata…"
            aria-label="Search audit logs"
            className="pl-10 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <p className="text-xs font-mono text-slate-500 shrink-0">
          Showing <strong className="text-slate-950 font-bold">{visible.length}</strong> of{" "}
          <strong className="text-slate-950 font-bold">{filtered.length}</strong> log{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Card list */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {logs.length === 0 && (
          <p className="p-8 text-center text-sm font-mono text-slate-400">No admin activity recorded yet.</p>
        )}
        {logs.length > 0 && filtered.length === 0 && (
          <p className="p-8 text-center text-sm font-mono text-slate-400">No audit logs match your search.</p>
        )}

        {visible.map((l) => {
          const isOpen = expandedIds.has(l.id);
          const hasMeta =
            l.meta !== null &&
            typeof l.meta === "object" &&
            !Array.isArray(l.meta) &&
            Object.keys(l.meta).length > 0;
          const date = new Date(l.created_at);
          const hasDetail = !!(hasMeta || l.entity_id || l.actor_id);
          return (
            <div key={l.id} className="grid gap-3 p-4 sm:p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start transition-colors hover:bg-slate-50/50">
              {/* Left: primary info */}
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-950 font-mono">{l.action}</p>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {l.entity}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  {l.actor_id && (
                    <span>
                      Actor:{" "}
                      <strong className="text-slate-800 font-mono font-semibold">
                        {l.actor_id.slice(0, 8)}…
                      </strong>
                    </span>
                  )}
                  {l.entity_id && (
                    <span>
                      Entity ID:{" "}
                      <strong className="text-slate-800 font-mono font-semibold">
                        {l.entity_id.slice(0, 8)}…
                      </strong>
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-mono text-slate-400">
                  {date.toLocaleString()} · Log ID: {l.id.slice(0, 8)}
                </p>

                {hasDetail && (
                  <button
                    type="button"
                    className="mt-1 flex items-center gap-1 text-xs font-mono font-semibold text-red-600 hover:text-red-700 transition-colors"
                    onClick={() => toggleRow(l.id)}
                    aria-expanded={isOpen}
                  >
                    <ChevronDown
                      className="size-3.5 transition-transform duration-150"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                    {isOpen ? "Hide metadata details" : "View metadata details"}
                  </button>
                )}

                {isOpen && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-2">
                    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Log ID</span>
                        <p className="mt-0.5 break-all font-mono text-slate-800">{l.id}</p>
                      </div>
                      {l.actor_id && (
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Actor (user ID)</span>
                          <p className="mt-0.5 break-all font-mono text-slate-800">{l.actor_id}</p>
                        </div>
                      )}
                      {l.entity_id && (
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Entity ID</span>
                          <p className="mt-0.5 break-all font-mono text-slate-800">{l.entity_id}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Timestamp (ISO)</span>
                        <p className="mt-0.5 font-mono text-slate-800">{date.toISOString()}</p>
                      </div>
                    </div>
                    {hasMeta && (
                      <div className="border-t border-slate-200 pt-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Payload Metadata</span>
                        <MetaTable meta={l.meta as Record<string, unknown>} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: status badge */}
              <Badge
                className={cn(
                  "w-fit font-mono font-bold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-full shrink-0",
                  actionBadgeClass(l.action),
                )}
              >
                {l.action.split(".").pop()}
              </Badge>
            </div>
          );
        })}
      </div>

      {filtered.length > 15 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs font-mono font-semibold"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" /> Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="size-4" /> Show all {filtered.length} logs ({filtered.length - 15} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

type AdminPaymentItem = {
  id: string;
  user_id: string;
  amount_ghs: number;
  credits: number;
  kind: string;
  method: string;
  reference: string;
  sender_name: string | null;
  status: string;
  admin_note?: string | null;
  created_at: string;
};

type PaymentSortKey = "newest" | "oldest" | "pending_first" | "highest_amount";

function PaymentsList({
  payments,
  members = [],
  reviewPayment,
}: {
  payments: AdminPaymentItem[];
  members?: MemberRow[];
  reviewPayment: { isPending: boolean; mutate: (vars: { id: string; approve: boolean }) => void };
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<PaymentSortKey>("pending_first");
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  const memberMap = new Map<string, MemberRow>(members.map((m) => [m.id, m]));

  const filtered = payments.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const member = memberMap.get(p.user_id);
    const amountStr = String(p.amount_ghs);
    return (
      (p.sender_name || "").toLowerCase().includes(q) ||
      (p.reference || "").toLowerCase().includes(q) ||
      (p.method || "").toLowerCase().includes(q) ||
      (p.kind || "").toLowerCase().includes(q) ||
      (p.status || "").toLowerCase().includes(q) ||
      amountStr.includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.user_id.toLowerCase().includes(q) ||
      (member?.full_name || "").toLowerCase().includes(q) ||
      (member?.phone || "").toLowerCase().includes(q) ||
      (member?.email || "").toLowerCase().includes(q) ||
      (member?.referral_code || "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "pending_first") {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "highest_amount") return Number(b.amount_ghs) - Number(a.amount_ghs);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const visible = expanded ? sorted : sorted.slice(0, 15);

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;
  const rejectedCount = payments.filter((p) => p.status === "rejected").length;

  const sortOptions: { key: PaymentSortKey; label: string }[] = [
    { key: "pending_first", label: "⚡ Pending First" },
    { key: "newest", label: "Newest First" },
    { key: "oldest", label: "Oldest First" },
    { key: "highest_amount", label: "Highest Amount" },
  ];

  const handleCopyRef = (ref: string, id: string) => {
    if (!ref || ref === "Not provided") return;
    void navigator.clipboard.writeText(ref);
    setCopiedRefId(id);
    toast.success("Reference code copied");
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sender, reference, phone, user name..."
              aria-label="Search payments"
              className="pl-10 rounded-xl border-slate-200 bg-white"
            />
          </div>
          <p className="text-xs font-mono text-slate-500 shrink-0">
            Showing <strong className="text-slate-950 font-bold">{visible.length}</strong> of{" "}
            <strong className="text-slate-950 font-bold">{sorted.length}</strong> payment{sorted.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Status Filter Badges & Sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              className={cn(
                "h-8 text-xs font-mono font-bold uppercase rounded-full px-3",
                statusFilter === "all" ? "bg-slate-950 text-white" : "border-slate-200 text-slate-600"
              )}
              onClick={() => setStatusFilter("all")}
            >
              All ({payments.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "pending" ? "default" : "outline"}
              className={cn(
                "h-8 text-xs font-mono font-bold uppercase rounded-full px-3 transition-all",
                statusFilter === "pending"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs shadow-amber-600/20"
                  : "border-amber-300 text-amber-700 hover:bg-amber-50"
              )}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "approved" ? "default" : "outline"}
              className={cn(
                "h-8 text-xs font-mono font-bold uppercase rounded-full px-3 transition-all",
                statusFilter === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              )}
              onClick={() => setStatusFilter("approved")}
            >
              Approved ({approvedCount})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "rejected" ? "default" : "outline"}
              className={cn(
                "h-8 text-xs font-mono font-bold uppercase rounded-full px-3 transition-all",
                statusFilter === "rejected"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-xs shadow-red-600/20"
                  : "border-red-300 text-red-700 hover:bg-red-50"
              )}
              onClick={() => setStatusFilter("rejected")}
            >
              Rejected ({rejectedCount})
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="size-3" /> Sort:
            </span>
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortBy(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-mono font-semibold transition-all border",
                  sortBy === opt.key
                    ? "bg-red-600 text-white border-red-600 shadow-xs shadow-red-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-slate-900"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Cards List */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {sorted.length === 0 && (
          <p className="p-8 text-center text-sm font-mono text-slate-400">
            {search || statusFilter !== "all" ? "No payments match your search filter." : "No payments received yet."}
          </p>
        )}
        {visible.map((p) => {
          const member = memberMap.get(p.user_id);
          const isPending = p.status === "pending";
          const isApproved = p.status === "approved";
          const isRejected = p.status === "rejected";

          return (
            <div
              key={p.id}
              className={cn(
                "grid gap-3 p-4 sm:p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center transition-all",
                isPending ? "bg-amber-50/20 hover:bg-amber-50/40" : "hover:bg-slate-50/50"
              )}
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-black tracking-tight text-slate-950 font-sans">
                    {ghs(p.amount_ghs)}
                  </p>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {p.kind === "registration" ? "Registration Fee" : `${p.credits} Credits`}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/60">
                    {p.method}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-slate-500">
                    MoMo Sender:{" "}
                    <strong className="text-slate-900 font-semibold font-sans">
                      {p.sender_name || "—"}
                    </strong>
                  </span>
                  {member && (
                    <span className="text-slate-500">
                      Account:{" "}
                      <strong className="text-slate-900 font-semibold font-sans">
                        {displayUserName(member.full_name, member.email, member.phone, "Member")}
                      </strong>{" "}
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({displayEmailOrPhone(member.email, member.phone, "No contact")})
                      </span>
                    </span>
                  )}
                </div>

                {p.reference && p.reference !== "Not provided" && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-xs font-mono text-slate-500">
                      Ref: <strong className="text-slate-900 font-bold">{p.reference}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(p.reference, p.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-0.5 rounded"
                      title="Copy reference code"
                      aria-label="Copy reference"
                    >
                      {copiedRefId === p.id ? (
                        <Check className="size-3 text-emerald-600 stroke-[3]" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                )}

                <p className="text-[11px] font-mono text-slate-400">
                  {new Date(p.created_at).toLocaleString()} · User ID: {p.user_id.slice(0, 8)}
                </p>
              </div>

              {isPending ? (
                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  <Button
                    size="sm"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 shadow-xs shadow-emerald-600/20 text-xs gap-1.5"
                    disabled={reviewPayment.isPending}
                    onClick={() => reviewPayment.mutate({ id: p.id, approve: true })}
                  >
                    <CheckCircle2 className="size-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold px-3 text-xs gap-1.5"
                    disabled={reviewPayment.isPending}
                    onClick={() => reviewPayment.mutate({ id: p.id, approve: false })}
                  >
                    <XCircle className="size-3.5" /> Reject
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:self-center">
                  <Badge
                    className={cn(
                      "font-mono font-bold uppercase tracking-wider text-[11px] px-3 py-1 rounded-full shadow-xs border",
                      isApproved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isRejected
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {p.status}
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length > 15 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs font-mono font-semibold"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" /> Show less (top 15)
              </>
            ) : (
              <>
                <ChevronDown className="size-4" /> Show all {sorted.length} payments ({sorted.length - 15} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

type MemberSortKey = "newest" | "oldest" | "active" | "spent" | "credits" | "referrals";

function MembersList({ members, currentUserId }: { members: MemberRow[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<MemberSortKey>("newest");

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const filtered = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.full_name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q) ||
      (m.referral_code || "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "active") {
      const aT = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
      const bT = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
      return bT - aT;
    }
    if (sortBy === "spent") return Number(b.spent_ghs) - Number(a.spent_ghs);
    if (sortBy === "credits") return b.credits - a.credits;
    if (sortBy === "referrals") return b.referral_count - a.referral_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const visible = expanded ? sorted : sorted.slice(0, 12);

  const sortOptions: { key: MemberSortKey; label: string }[] = [
    { key: "newest", label: "🆕 Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "active", label: "Recently Active" },
    { key: "spent", label: "Highest Spent" },
    { key: "credits", label: "Most Credits" },
    { key: "referrals", label: "Most Referrals" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {/* Search row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or referral code..."
              aria-label="Search members"
              className="pl-10 rounded-xl border-slate-200 bg-white"
            />
          </div>
          <p className="text-xs font-mono text-slate-500 shrink-0">
            Showing <strong className="text-slate-950 font-bold">{visible.length}</strong> of{" "}
            <strong className="text-slate-950 font-bold">{sorted.length}</strong> members
          </p>
        </div>

        {/* Sort controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> Sort:
          </span>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-mono font-semibold transition-all border",
                sortBy === opt.key
                  ? "bg-red-600 text-white border-red-600 shadow-xs shadow-red-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-slate-900"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {sorted.length === 0 && (
          <p className="p-8 text-center text-sm font-mono text-slate-400">
            {search ? "No members match your search criteria." : "No registered members yet."}
          </p>
        )}
        {visible.map((m) => {
          const nameDisplay = displayUserName(m.full_name, m.email, m.phone, "Member");
          const isSynthetic = isSyntheticPhoneEmail(m.email);
          const phoneDisplay = m.phone || (isSynthetic ? extractPhoneFromSyntheticEmail(m.email) : null);
          const realEmail = !isSynthetic && m.email ? m.email : null;
          const initials = nameDisplay
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const isNew = now - new Date(m.created_at).getTime() < oneDayMs;

          return (
            <div key={m.id} className="grid gap-3 p-4 sm:p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center transition-colors hover:bg-slate-50/50">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono font-bold text-sm shadow-2xs">
                  {initials}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-950 text-sm truncate font-sans">
                      {nameDisplay}
                    </span>
                    {isNew && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-mono font-black text-white tracking-widest animate-pulse">
                        NEW
                      </span>
                    )}
                    {m.is_admin && (
                      <Badge className="bg-slate-950 text-white font-mono font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full border-slate-900">
                        ADMIN
                      </Badge>
                    )}
                    {m.is_partner && (
                      <Badge className="bg-red-50 text-red-700 border border-red-200/80 font-mono font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full">
                        PARTNER
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {phoneDisplay && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="size-3 text-slate-400" /> {phoneDisplay}
                      </span>
                    )}
                    {realEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3 text-slate-400" /> {realEmail}
                      </span>
                    )}
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700 border border-slate-200">
                      Code: {m.referral_code}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5 font-mono">
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <Coins className="size-3 text-red-600" /> {m.credits} credit{m.credits === 1 ? "" : "s"}
                    </span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">
                      {m.max_verdicts ?? 2} verdict{(m.max_verdicts ?? 2) === 1 ? "" : "s"}/scan
                    </span>
                    <span>·</span>
                    <CreditAdjuster
                      userId={m.id}
                      label={nameDisplay}
                      currentVerdicts={m.max_verdicts}
                      currentCredits={m.credits}
                      currentSpent={m.spent_ghs}
                      trigger={
                        <span className="cursor-pointer font-medium hover:text-red-600 transition-colors inline-flex items-center gap-1 group">
                          Spent: <strong className="text-slate-950 group-hover:text-red-600 underline decoration-dotted underline-offset-2 font-bold">{ghs(m.spent_ghs)}</strong>
                          <Pencil className="size-2.5 text-slate-400 group-hover:text-red-600 transition-colors" />
                        </span>
                      }
                    />
                    <span>·</span>
                    <span>Joined: {new Date(m.created_at).toLocaleDateString()}</span>
                    {m.last_sign_in_at && (
                      <>
                        <span>·</span>
                        <span>Active: {new Date(m.last_sign_in_at).toLocaleDateString()}</span>
                      </>
                    )}
                    {m.referral_count > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-red-600 font-bold">{m.referral_count} referral{m.referral_count === 1 ? "" : "s"}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-center">
                <CreditAdjuster
                  userId={m.id}
                  label={nameDisplay}
                  currentVerdicts={m.max_verdicts}
                  currentCredits={m.credits}
                  currentSpent={m.spent_ghs}
                />
                {m.id !== currentUserId && (
                  <RemoveMember userId={m.id} label={nameDisplay} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length > 12 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs font-mono font-semibold"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" /> Show less (top 12)
              </>
            ) : (
              <>
                <ChevronDown className="size-4" /> Show all {sorted.length} members ({sorted.length - 12} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ExplodeCard() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const explodeFn = useServerFn(explodePlatformData);

  const explode = useMutation({
    mutationFn: async () => {
      await explodeFn({ data: undefined });
    },
    onSuccess: async () => {
      setOpen(false);
      setConfirm("");
      await queryClient.invalidateQueries();
      toast.success("Platform data cleared — platform activity reset.");
    },
    onError: (e: Error) =>
      toast.error(e.message === "FORBIDDEN" ? "Admins only" : e.message),
  });

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-red-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950 font-mono">
              Explode platform activity data
            </h3>
          </div>
          <p className="max-w-2xl text-xs text-slate-600 leading-relaxed font-normal">
            Wipes all payments, analyses, credit history, partner commissions, applications and audit logs, resetting balances and partner earnings to zero. Accounts, roles, packages and payment configuration remain preserved.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold shrink-0 shadow-xs shadow-red-600/20"
        >
          Explode Data
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirm(""); }}>
        <DialogContent className="rounded-2xl sm:rounded-3xl border-slate-200 sm:max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-950">Explode all platform data?</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs leading-relaxed">
              This action permanently clears the admin dashboard and every partner dashboard history. Type <strong className="text-red-600 font-mono font-bold">EXPLODE</strong> below to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.toUpperCase())}
              placeholder="Type EXPLODE to confirm"
              aria-label="Type EXPLODE to confirm"
              className="rounded-xl font-mono uppercase tracking-widest text-center border-red-300 focus-visible:ring-red-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirm !== "EXPLODE" || explode.isPending}
              onClick={() => explode.mutate()}
              className="rounded-xl bg-red-600 hover:bg-red-700 font-bold"
            >
              {explode.isPending ? "Clearing…" : "Confirm Explode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  subtext,
  alert,
  icon: Icon,
  action,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
  alert?: boolean;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  if (highlight) {
    return (
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl flex flex-col justify-between min-h-[120px]">
        {/* Ambient red blur */}
        <div className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-red-600/20 blur-2xl group-hover:bg-red-600/30 transition-all duration-300" />
        <LogoSymbol
          aria-hidden
          className="absolute right-3 top-3 h-5 w-auto opacity-20 brightness-0 invert transition-transform duration-300 group-hover:scale-110 group-hover:opacity-35"
        />
        <div>
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate pr-6">
              {label}
            </p>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-white font-sans truncate">
            {value}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <p className="text-[10px] font-mono text-slate-400 truncate">{subtext || "PREDICTA metric"}</p>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-h-[120px]",
        alert
          ? "border-amber-300 bg-amber-50/30 hover:border-amber-400"
          : "border-slate-200/90 hover:border-slate-300"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </span>
          {Icon && (
            <div className={cn(
              "size-6 rounded-full flex items-center justify-center shrink-0",
              alert ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-600"
            )}>
              <Icon className="size-3.5" />
            </div>
          )}
        </div>
        <p className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-sans truncate">
          {value}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <p className="text-[10px] font-mono text-slate-400 truncate">{subtext || "PREDICTA metric"}</p>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/** Custom 10-day strip calendar for browsing daily revenue history */
function RevenueHistoryCalendar({
  open,
  onOpenChange,
  selected,
  onSelect,
  revenueDays,
  snapshotMap,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: Date | null;
  onSelect: (day: Date | undefined) => void;
  revenueDays: Date[];
  snapshotMap?: Map<string, DailyCommissionSnapshot>;
}) {
  const [page, setPage] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement>(null);

  const revenueDaySet = useMemo(() => {
    const s = new Set<string>();
    for (const d of revenueDays) {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      s.add(`${yr}-${mo}-${da}`);
    }
    return s;
  }, [revenueDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = useMemo(() => {
    const result: Date[] = [];
    const startOffset = page * 10;
    for (let i = startOffset + 9; i >= startOffset; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      result.push(d);
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const selectedStr = selected ? toDateStr(selected) : null;
  const todayStr = toDateStr(today);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (activeDayRef.current) {
        activeDayRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      } else if (stripRef.current && page === 0) {
        stripRef.current.scrollTo({
          left: stripRef.current.scrollWidth,
          behavior: "smooth",
        });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [open, page]);

  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];
  const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const rangeLabel = rangeStart && rangeEnd ? `${fmtShort(rangeStart)} – ${fmtShort(rangeEnd)}` : "";

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) setPage(0);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:text-white hover:scale-110 active:scale-95 touch-manipulation"
          aria-label="View daily revenue history"
        >
          <CalendarDays className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-1.5rem)] max-w-[480px] sm:w-auto p-0 border border-slate-200/90 bg-white text-slate-900 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden touch-manipulation"
        align="end"
        sideOffset={8}
        collisionPadding={12}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 px-4 pt-3.5 pb-2.5 border-b border-slate-100 bg-slate-50/70">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-950 font-mono uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span className="size-2 rounded-full bg-red-600 animate-pulse shrink-0" />
              Daily Revenue History
            </p>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5 font-medium truncate">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-90 shadow-xs touch-manipulation"
              title="Previous 10 days"
              aria-label="Previous 10 days"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={cn(
                "flex size-7 items-center justify-center rounded-lg border transition-all active:scale-90 shadow-xs touch-manipulation",
                page === 0
                  ? "border-slate-100 bg-slate-100/50 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              )}
              title="Next 10 days"
              aria-label="Next 10 days"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* 10-day strip */}
        <div
          ref={stripRef}
          className="flex gap-1.5 p-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-contain touch-pan-x"
        >
          {days.map((day) => {
            const ds = toDateStr(day);
            const isSelected = ds === selectedStr;
            const isToday = ds === todayStr;
            const isActiveDay = isSelected || (!selectedStr && isToday);
            const hasRevenue = revenueDaySet.has(ds);
            const snap = snapshotMap?.get(ds);
            const tooltipTitle = snap
              ? `${hasRevenue ? `Revenue: ${ghs(snap.revenue_ghs || 0)} · ` : ""}Dev ${snap.developer_commission_rate}%, Admin ${snap.admin_commission_rate}%`
              : hasRevenue
                ? "Revenue recorded on this day"
                : isToday
                  ? "Today (Live Commission Rates)"
                  : "No revenue recorded";

            return (
              <button
                key={ds}
                ref={isActiveDay ? activeDayRef : null}
                type="button"
                onClick={() => {
                  onSelect(day);
                }}
                title={tooltipTitle}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl px-2 py-2 min-w-[2.75rem] sm:min-w-[3rem] shrink-0 transition-all duration-200 group/day cursor-pointer touch-manipulation select-none",
                  isSelected
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105 ring-2 ring-red-400/50"
                    : isToday
                      ? "bg-red-50 border-2 border-red-500/80 text-slate-950 hover:bg-red-100/80 hover:border-red-600 shadow-xs"
                      : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-slate-950",
                )}
              >
                <span className={cn(
                  "text-[9px] font-mono font-bold uppercase tracking-wider leading-none",
                  isSelected ? "text-white/85" : isToday ? "text-red-600 font-extrabold" : "text-slate-400",
                )}>
                  {isToday ? "TODAY" : day.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2)}
                </span>
                <span className={cn(
                  "text-sm font-extrabold leading-none mt-1.5 font-sans",
                  isSelected ? "text-white" : isToday ? "text-red-700" : "text-slate-900",
                )}>
                  {day.getDate()}
                </span>
                <span className={cn(
                  "text-[9px] font-mono font-semibold leading-none mt-1",
                  isSelected ? "text-white/80" : "text-slate-400",
                )}>
                  {day.toLocaleDateString("en-GB", { month: "short" })}
                </span>
                {hasRevenue && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 size-2 rounded-full ring-2",
                      isSelected
                        ? "bg-white ring-red-700 shadow-xs"
                        : "bg-red-600 ring-white shadow-xs",
                    )}
                    title="Revenue recorded on this day"
                  />
                )}
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full bg-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {page > 0 && (
          <div className="border-t border-slate-100 px-3.5 py-2 flex items-center justify-between bg-slate-50/70">
            <span className="text-[10px] font-mono text-slate-500 font-medium">{page * 10} days ago</span>
            <button
              type="button"
              onClick={() => setPage(0)}
              className="text-[10px] font-mono font-bold text-red-600 hover:text-red-700 hover:underline transition-colors touch-manipulation"
            >
              Reset to Recent (Today) →
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function PartnerPayouts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [rates, setRates] = useState<Record<string, string>>({});
  const [selectedPartnerPayouts, setSelectedPartnerPayouts] = useState<{ id: string; name: string } | null>(null);

  const { data, isFetching } = useQuery(adminPartnerListQuery(search));
  const rows = data ?? [];

  const setRate = useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => {
      if (!Number.isFinite(rate) || rate < 0 || rate > 100)
        throw new Error("Commission must be between 0 and 100%.");
      const { error } = await supabase.rpc("admin_set_commission_rate", { _user_id: id, _rate: rate });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Partner commission percentage saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clearPayout = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { error } = await supabase.rpc("admin_clear_partner_payout", {
        _user_id: id,
        _note: note ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Payout cleared and recorded in history");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partners by name, email or code..."
          aria-label="Search partners"
          className="pl-10 rounded-xl border-slate-200 bg-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.length === 0 && (
          <p className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-sm font-mono text-slate-400 sm:col-span-2 xl:col-span-3">
            {isFetching ? "Loading partners…" : "No approved partners found."}
          </p>
        )}
        {rows.map((p: AdminPartnerRow) => {
          const lifetimeRev = Number(p.lifetime_revenue_ghs ?? p.revenue_ghs);
          const lifetimeComm = Number(p.lifetime_commissions_ghs ?? p.commissions_ghs);
          const unpaidComm = Number(p.commissions_ghs ?? 0);
          const hasRequested = Boolean(p.payout_requested_at);

          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col justify-between rounded-2xl sm:rounded-3xl border bg-white p-5 shadow-xs transition-all hover:shadow-md gap-4",
                hasRequested
                  ? "border-amber-300 ring-2 ring-amber-200/60 shadow-amber-100"
                  : "border-slate-200/90 hover:border-slate-300"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-bold text-slate-950 font-sans">
                        {displayUserName(p.full_name, p.email, undefined, "Partner")}
                      </p>
                      {hasRequested && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 animate-pulse">
                          💸 PAYOUT REQUESTED
                        </span>
                      )}
                    </div>
                    <p className="break-all text-xs text-slate-500 font-mono mt-0.5">{displayEmailOrPhone(p.email)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800 border border-slate-200">
                        Code: {p.referral_code}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-600 font-semibold">{p.referral_count} referred</span>
                    </div>
                  </div>
                </div>

                {/* Lifetime Performance */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Lifetime Performance</p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span>Revenue: <strong className="font-bold text-slate-900">{ghs(lifetimeRev)}</strong></span>
                    <span>Total Earned: <strong className="font-bold text-red-600">{ghs(lifetimeComm)}</strong></span>
                  </div>
                </div>

                {/* Current Period */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Period Rev</p>
                    <p className="mt-0.5 truncate text-sm font-bold text-slate-950 font-sans">{ghs(p.revenue_ghs)}</p>
                  </div>
                  <div className={cn("rounded-xl border p-2.5", unpaidComm > 0 ? "border-red-200 bg-red-50/50" : "border-slate-200 bg-white")}>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600">Unpaid Balance</p>
                    <p className="mt-0.5 truncate text-sm font-black text-red-600 font-sans">{ghs(unpaidComm)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`rate-${p.id}`} className="text-xs font-mono font-bold text-slate-700">
                      Commission %
                    </Label>
                    <Input
                      id={`rate-${p.id}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={rates[p.id] ?? String(p.commission_rate)}
                      onChange={(e) => setRates({ ...rates, [p.id]: e.target.value })}
                      className="h-9 text-sm rounded-xl font-mono"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 shrink-0 px-3 font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    disabled={setRate.isPending}
                    onClick={() =>
                      setRate.mutate({ id: p.id, rate: Number(rates[p.id] ?? p.commission_rate) })
                    }
                  >
                    Save %
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant={unpaidComm > 0 ? "default" : "outline"}
                  className={cn(
                    "w-full font-bold rounded-xl text-xs",
                    hasRequested && unpaidComm > 0
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-500/25"
                      : unpaidComm > 0
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-xs shadow-red-600/20"
                        : "border-slate-200 text-slate-700"
                  )}
                  disabled={clearPayout.isPending}
                  onClick={() => clearPayout.mutate({ id: p.id })}
                >
                  {hasRequested && unpaidComm > 0
                    ? `✓ Pay ${ghs(unpaidComm)} (Requested)`
                    : unpaidComm > 0
                      ? `Mark ${ghs(unpaidComm)} as paid`
                      : "Clear current period"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full font-mono text-xs text-slate-500 hover:text-slate-950 gap-1.5 rounded-xl"
                  onClick={() => setSelectedPartnerPayouts({ id: p.id, name: displayUserName(p.full_name, p.email, undefined, "Partner") })}
                >
                  <Clock className="size-3.5" />
                  View payout history
                </Button>
                {p.payout_cleared_at && (
                  <p className="text-center text-[10px] font-mono text-slate-400">
                    Last payout: {new Date(p.payout_cleared_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPartnerPayouts && (
        <PartnerPayoutHistoryDialog
          partnerId={selectedPartnerPayouts.id}
          partnerName={selectedPartnerPayouts.name}
          onClose={() => setSelectedPartnerPayouts(null)}
        />
      )}
    </div>
  );
}

function PartnerPayoutHistoryDialog({
  partnerId,
  partnerName,
  onClose,
}: {
  partnerId: string;
  partnerName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [confirmRevertId, setConfirmRevertId] = useState<string | null>(null);
  const { data: payouts, isLoading } = useQuery(adminPartnerPayoutsQuery(partnerId));

  const revertPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      const { error } = await supabase.rpc("admin_revert_partner_payout", {
        _payout_id: payoutId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-partner-payouts"] }),
        queryClient.invalidateQueries({ queryKey: ["partner-payouts"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-partners"] }),
        queryClient.invalidateQueries(),
      ]);
      toast.success("Payout reverted and partner unpaid balance restored");
      setConfirmRevertId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl sm:rounded-3xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-950 font-sans">
            Payout History — {partnerName}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Record of cleared payouts and disbursements. Revert any mistakenly recorded payout to restore the unpaid balance.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {isLoading && <p className="p-4 text-center text-xs font-mono text-slate-400">Loading history…</p>}
          {!isLoading && (payouts ?? []).length === 0 && (
            <p className="p-4 text-center text-xs font-mono text-slate-400">No previous payouts recorded for this partner.</p>
          )}
          {(payouts ?? []).map((p: PartnerPayoutRow) => (
            <div key={p.id} className="flex items-center justify-between p-3.5 text-sm gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-950 font-sans">{ghs(p.amount_ghs)}</p>
                <p className="text-xs font-mono text-slate-400">{new Date(p.cleared_at).toLocaleString()}</p>
                {p.note && <p className="text-xs text-slate-500 italic mt-0.5">Note: {p.note}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border-emerald-200 rounded-full">
                  Disbursed
                </Badge>
                {confirmRevertId === p.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700"
                      disabled={revertPayout.isPending}
                      onClick={() => revertPayout.mutate(p.id)}
                    >
                      {revertPayout.isPending ? "Reverting…" : "Confirm"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs rounded-lg"
                      disabled={revertPayout.isPending}
                      onClick={() => setConfirmRevertId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs font-mono text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 font-semibold rounded-lg"
                    onClick={() => setConfirmRevertId(p.id)}
                    title="Revert mistakenly cleared payout"
                  >
                    <RotateCcw className="size-3" />
                    Revert
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type MemberRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  credits: number;
  referral_code: string;
  created_at: string;
  last_sign_in_at: string | null;
  registration_paid: boolean;
  registration_paid_at: string | null;
  is_partner: boolean;
  is_admin: boolean;
  referred_by: string | null;
  referrer_name: string | null;
  spent_ghs: number;
  referral_count: number;
  max_verdicts?: number;
};

function PartnerManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [onlyPartners, setOnlyPartners] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>("");

  const { data, isFetching } = useQuery(
    adminMemberListQuery({ search, onlyPartners, partnerId }),
  );
  const rows = (data ?? []) as MemberRow[];

  const setPartner = useMutation({
    mutationFn: async ({ id, make }: { id: string; make: boolean }) => {
      const { error } = await supabase.rpc("admin_set_partner", { _user_id: id, _make: make });
      if (error) throw new Error(error.message);
    },
    onSuccess: async (_d, vars) => {
      await queryClient.invalidateQueries();
      toast.success(vars.make ? "Partner role granted" : "Partner role revoked");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [expandedRows, setExpandedRows] = useState(false);
  const [sortRows, setSortRows] = useState<MemberSortKey>("newest");

  const sortedRows = [...rows].sort((a, b) => {
    if (sortRows === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortRows === "active") {
      const aT = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
      const bT = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
      return bT - aT;
    }
    if (sortRows === "spent") return Number(b.spent_ghs) - Number(a.spent_ghs);
    if (sortRows === "credits") return b.credits - a.credits;
    if (sortRows === "referrals") return b.referral_count - a.referral_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const visibleRows = expandedRows ? sortedRows : sortedRows.slice(0, 12);

  return (
    <div className="space-y-6">
      <PartnerInviteLink />
      <PartnerApplications />

      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or code..."
                aria-label="Search members"
                className="pl-10 rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant={!onlyPartners && !partnerId ? "default" : "outline"}
                className={cn(
                  "flex-1 sm:flex-none rounded-xl font-mono text-xs font-bold uppercase",
                  !onlyPartners && !partnerId ? "bg-slate-950 text-white" : "border-slate-200 text-slate-700"
                )}
                onClick={() => {
                  setOnlyPartners(false);
                  setPartnerId(null);
                }}
              >
                All members
              </Button>
              <Button
                type="button"
                size="sm"
                variant={onlyPartners ? "default" : "outline"}
                className={cn(
                  "flex-1 sm:flex-none rounded-xl font-mono text-xs font-bold uppercase",
                  onlyPartners ? "bg-red-600 text-white shadow-xs shadow-red-600/20" : "border-slate-200 text-slate-700"
                )}
                onClick={() => {
                  setOnlyPartners(true);
                  setPartnerId(null);
                }}
              >
                Partners only
              </Button>
              {partnerId && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto rounded-xl text-xs font-mono font-semibold"
                  onClick={() => setPartnerId(null)}
                >
                  Clear filter: {partnerName}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="size-3" /> Sort:
            </span>
            {(["newest", "oldest", "active", "spent", "credits", "referrals"] as MemberSortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortRows(key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-mono font-semibold transition-all border",
                  sortRows === key
                    ? "bg-red-600 text-white border-red-600 shadow-xs shadow-red-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-slate-900"
                )}
              >
                {key === "newest" ? "🆕 Newest" : key === "oldest" ? "Oldest" : key === "active" ? "Recently Active" : key === "spent" ? "Highest Spent" : key === "credits" ? "Most Credits" : "Most Referrals"}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          {rows.length === 0 && (
            <p className="p-8 text-center text-sm font-mono text-slate-400">
              {isFetching ? "Loading member records…" : "No members match this filter."}
            </p>
          )}
          {visibleRows.map((m) => (
            <div key={m.id} className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50/50">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-950 font-sans">
                  <span className="truncate">{displayUserName(m.full_name, m.email, m.phone, "Member")}</span>
                  {m.is_admin && (
                    <Badge className="shrink-0 bg-slate-950 text-white font-mono font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full border-slate-900">
                      ADMIN
                    </Badge>
                  )}
                  {m.is_partner && (
                    <Badge className="shrink-0 bg-red-50 text-red-700 border border-red-200/80 font-mono font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full">
                      PARTNER
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs font-mono text-slate-500">
                  {displayEmailOrPhone(m.email, m.phone)}
                </p>
                <p className="truncate text-xs font-mono text-slate-500">
                  Code: <strong className="text-slate-800 font-bold">{m.referral_code}</strong> · Spent: {ghs(m.spent_ghs)}
                </p>
                <p className="truncate text-[11px] font-mono text-slate-400">
                  {m.is_partner
                    ? `${m.referral_count} referred member${m.referral_count === 1 ? "" : "s"}`
                    : m.referrer_name
                      ? `Joined via ${m.referrer_name}`
                      : "Direct platform signup"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                {m.is_partner && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none rounded-xl border-slate-200 text-xs font-mono font-semibold"
                    onClick={() => {
                      setPartnerId(m.id);
                      setPartnerName(displayUserName(m.full_name, m.email, m.phone, "partner"));
                      setOnlyPartners(false);
                      setSearch("");
                    }}
                  >
                    View referrals
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={m.is_partner ? "destructive" : "default"}
                  className={cn(
                    "flex-1 sm:flex-none rounded-xl text-xs font-bold",
                    m.is_partner
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  )}
                  disabled={setPartner.isPending}
                  onClick={() => setPartner.mutate({ id: m.id, make: !m.is_partner })}
                >
                  {m.is_partner ? "Revoke Partner" : "Grant Partner Role"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {sortedRows.length > 12 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedRows((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs font-mono font-semibold"
            >
              {expandedRows ? (
                <>
                  <ChevronUp className="size-4" /> Show less (top 12)
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" /> Show all {sortedRows.length} members ({sortedRows.length - 12} more)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditAdjuster({
  userId,
  label,
  currentVerdicts,
  currentCredits,
  currentSpent,
  trigger,
}: {
  userId: string;
  label: string;
  currentVerdicts?: number | undefined;
  currentCredits?: number | undefined;
  currentSpent?: number | undefined;
  trigger?: React.ReactNode;
}) {
  return (
    <CreditAdjusterInner
      userId={userId}
      label={label}
      currentVerdicts={currentVerdicts}
      currentCredits={currentCredits}
      currentSpent={currentSpent}
      trigger={trigger}
    />
  );
}

function PartnerInviteLink() {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined" ? `${window.location.origin}/register?partner=1` : "";

  const handleCopy = () => {
    if (!link) return;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Partner registration link copied to clipboard");
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-red-200 bg-gradient-to-br from-red-50/60 via-white to-red-50/30 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-red-600" />
        <p className="text-sm font-bold uppercase tracking-wider text-slate-950 font-mono">
          Partner Invitation Link
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
        Send this dedicated link to prospective affiliate partners. Applicants skip the 50 GHS member fee and enter your pending review queue below for approval.
      </p>
      <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          value={link}
          aria-label="Partner registration link"
          className="rounded-xl border-red-200 bg-white font-mono text-xs"
        />
        <Button
          type="button"
          className="min-w-[130px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs shadow-red-600/20"
          onClick={handleCopy}
        >
          {copied ? (
            <span className="flex items-center gap-1.5 font-bold text-white animate-in zoom-in-75 duration-200">
              <Check className="size-4 stroke-[3]" /> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Copy className="size-4" /> Copy link
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function PartnerApplications() {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery({
    ...adminPartnerApplicationsQuery(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const rows = (data ?? []) as AdminApplicationRow[];

  const review = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase.rpc("review_partner_application", {
        _application_id: id,
        _approve: approve,
        _note: approve ? "Approved as partner" : "Application rejected",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async (_d, vars) => {
      await queryClient.invalidateQueries();
      toast.success(vars.approve ? "Partner approved" : "Application rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-wider text-slate-950 font-mono flex items-center gap-1.5">
          <Users className="size-4 text-red-600" /> Pending Partner Applications
        </p>
        <span className="text-xs font-mono font-bold text-slate-400">
          {rows.length} total
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm font-mono text-slate-400">
            {isFetching ? "Loading partner applications…" : "No partner applications in queue."}
          </p>
        )}
        {rows.map((a) => (
          <div key={a.id} className="flex flex-col gap-3 p-4 sm:p-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-950 font-sans">
                  <span className="truncate">{displayUserName(a.full_name, a.email, a.phone, "Applicant")}</span>
                  {a.status !== "pending" && (
                    <Badge
                      className={cn(
                        "shrink-0 font-mono font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full",
                        a.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : a.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {a.status}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 break-all text-xs font-mono text-slate-500">{displayEmailOrPhone(a.email, a.phone)}</p>
              </div>
              {a.status === "pending" && (
                <span className="shrink-0 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-700 animate-pulse">
                  PENDING REVIEW
                </span>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs space-y-1 font-mono text-slate-600">
              <p>📞 Phone: <strong className="text-slate-900">{a.phone ?? "Not provided"}</strong> · 🕐 Submitted: {new Date(a.created_at).toLocaleDateString()}</p>
              <p>🎯 Audience: <strong className="text-slate-900 font-sans">{a.audience}</strong></p>
              <p>💳 Payout: <strong className="text-slate-900">{a.payout_method}</strong> ({a.payout_details})</p>
            </div>

            {a.status === "pending" && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs shadow-emerald-600/20"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: a.id, approve: true })}
                >
                  <CheckCircle2 className="size-3.5" /> Approve Partner
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs gap-1.5"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: a.id, approve: false })}
                >
                  <XCircle className="size-3.5" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const ADMIN_EDIT_PASSWORD = "1234";

function CreditAdjusterInner({
  userId,
  label,
  currentVerdicts = 2,
  currentCredits,
  currentSpent = 0,
  trigger,
}: {
  userId: string;
  label: string;
  currentVerdicts?: number | undefined;
  currentCredits?: number | undefined;
  currentSpent?: number | undefined;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [amount, setAmount] = useState("5");
  const [verdicts, setVerdicts] = useState(String(currentVerdicts || 2));
  const [reason, setReason] = useState("");

  const [reduceSpentBy, setReduceSpentBy] = useState("");
  const [targetSpent, setTargetSpent] = useState("");
  const [spentMode, setSpentMode] = useState<"reduce" | "set">("reduce");

  const { data: sitePackages } = useQuery(packagesQuery());

  const packageList = useMemo(() => {
    if (sitePackages && sitePackages.length > 0) {
      return [...sitePackages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return [
      { id: "starter", name: "Starter", max_verdicts: 2, credits: 5, sort_order: 0 },
      { id: "plus", name: "Plus", max_verdicts: 4, credits: 15, sort_order: 1 },
      { id: "premium", name: "Premium", max_verdicts: 8, credits: 30, sort_order: 2 },
    ];
  }, [sitePackages]);

  useEffect(() => {
    if (open) {
      setVerdicts(String(currentVerdicts || 2));
    }
  }, [open, currentVerdicts]);

  const handleVerifyPassword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput.trim() === ADMIN_EDIT_PASSWORD) {
      setAuthOpen(false);
      setPasswordInput("");
      setPasswordError(false);
      setOpen(true);
      toast.success("Authorization granted");
    } else {
      setPasswordError(true);
      toast.error("Incorrect authorization password");
    }
  };

  const handleOpenAuth = () => {
    setPasswordInput("");
    setPasswordError(false);
    setAuthOpen(true);
  };

  const adjustCredits = useMutation({
    mutationFn: async (sign: 1 | -1) => {
      const delta = sign * Math.abs(Number(amount));
      if (!Number.isFinite(delta) || delta === 0) throw new Error("Enter a credit amount.");
      const vNum = Math.max(1, Math.trunc(Number(verdicts) || 2));
      const note = reason.trim();
      const { error } = await supabase.rpc("admin_adjust_credits" as never, {
        _user_id: userId,
        _delta: Math.trunc(delta),
        _reason: note || "Admin credit adjustment",
        _max_verdicts: vNum,
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      setReason("");
      setOpen(false);
      await queryClient.invalidateQueries();
      toast.success("Credits and scan verdict limit updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adjustSpent = useMutation({
    mutationFn: async () => {
      let redBy: number | undefined = undefined;
      let setSpent: number | undefined = undefined;

      if (spentMode === "reduce") {
        const val = Number(reduceSpentBy);
        if (!Number.isFinite(val) || val <= 0) throw new Error("Enter a valid reduction amount in GHS.");
        redBy = val;
      } else {
        const val = Number(targetSpent);
        if (!Number.isFinite(val) || val < 0) throw new Error("Enter a valid target total spent amount.");
        setSpent = val;
      }

      const note = reason.trim();

      try {
        const { error: rpcErr } = await supabase.rpc(
          "admin_adjust_member_spent" as never,
          {
            _user_id: userId,
            _reduce_by: redBy ?? null,
            _set_total_spent: setSpent ?? null,
            _reason: note || null,
          } as never
        );

        if (!rpcErr) return;
      } catch {
        // Fallback below
      }

      const { data: payments, error: fetchErr } = await supabase
        .from("payments")
        .select("id, amount_ghs, status, created_at")
        .eq("user_id", userId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (fetchErr) throw new Error(fetchErr.message);

      const approvedPayments = payments ?? [];
      const currentTotal = approvedPayments.reduce((acc, p) => acc + Number(p.amount_ghs || 0), 0);

      let amountToSubtract = 0;
      if (redBy !== undefined) {
        amountToSubtract = Math.abs(redBy);
      } else if (setSpent !== undefined) {
        amountToSubtract = currentTotal - setSpent;
      }

      if (amountToSubtract <= 0 && setSpent === undefined) {
        return;
      }

      if (approvedPayments.length > 0) {
        let remainingToDeduct = amountToSubtract;

        for (const payment of approvedPayments) {
          if (remainingToDeduct <= 0) break;
          const currentAmt = Number(payment.amount_ghs || 0);
          const deduct = Math.min(currentAmt, remainingToDeduct);
          const newAmt = Math.max(0, currentAmt - deduct);
          remainingToDeduct -= deduct;

          const { error: updateErr } = await supabase
            .from("payments")
            .update({
              amount_ghs: newAmt,
              admin_note: note ? `${note} (Spent adjustment)` : "Admin total spent reduction",
            })
            .eq("id", payment.id);

          if (updateErr) throw new Error(updateErr.message);
        }
      } else {
        const refCode = `ADJ-${Date.now().toString(36).toUpperCase()}`;
        const targetVal = setSpent !== undefined ? setSpent : Math.max(0, 0 - (redBy || 0));
        const { error: insertErr } = await supabase.from("payments").insert({
          user_id: userId,
          amount_ghs: targetVal,
          credits: 0,
          method: "Admin Adjustment",
          reference: refCode,
          status: "approved",
          admin_note: note || "Admin total spent adjustment",
        });

        if (insertErr) throw new Error(insertErr.message);
      }

      try {
        await supabase.from("audit_logs").insert({
          action: "member.spent_adjusted",
          entity: "profiles",
          entity_id: userId,
          meta: { reduceBy: redBy, setTotalSpent: setSpent, previousTotal: currentTotal, reason: note },
        });
      } catch {
        // Audit log insert optional
      }
    },
    onSuccess: async () => {
      setReduceSpentBy("");
      setTargetSpent("");
      setReason("");
      setOpen(false);
      await queryClient.invalidateQueries();
      toast.success("Total spent balance updated successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      {/* Authorization Password Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader>
            <div className="size-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
              <Lock className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-950 font-sans">
              Admin Authorization
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter the admin passkey to edit credits or adjust spent balances for <strong>{label}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyPassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor={`pass-${userId}`} className="text-xs font-mono font-bold text-slate-700">
                Passkey
              </Label>
              <Input
                id={`pass-${userId}`}
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError(false);
                }}
                placeholder="Enter passkey..."
                autoFocus
                className={cn("rounded-xl font-mono text-center tracking-widest", passwordError && "border-red-500 focus-visible:ring-red-500")}
              />
              {passwordError && (
                <p className="text-[11px] font-mono font-bold text-red-600">
                  Incorrect passkey. Access denied.
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setAuthOpen(false)} className="rounded-xl border-slate-200">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="rounded-xl bg-slate-950 text-white hover:bg-slate-800 font-bold">
                Unlock Access
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger ? (
          <div onClick={handleOpenAuth} className="inline-block cursor-pointer">
            {trigger}
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenAuth}
            className="gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-xs font-semibold h-8 px-2.5"
          >
            <Pencil className="size-3.5 text-red-600" /> Edit Credits / Spent
          </Button>
        )}
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-950 font-sans flex items-center gap-2">
              <Pencil className="size-4 text-red-600" /> Member Balance Adjustment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Grant/deduct credits, configure per-scan verdict limits, or adjust total spent for <strong>{label}</strong>.
            </DialogDescription>
          </DialogHeader>

          {/* Current status summary banner */}
          <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-3.5 text-xs font-mono space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>🪙 Balance: <strong className="text-slate-950 font-bold">{currentCredits ?? 0} credits</strong></span>
              <span>🎯 Limit: <strong className="text-slate-950 font-bold">{currentVerdicts} verdicts/scan</strong></span>
              <span>💳 Spent: <strong className="text-slate-950 font-bold">{ghs(currentSpent)}</strong></span>
            </div>
          </div>

          <div className="grid gap-4 py-1">
            {/* SECTION 1: REDUCE / EDIT TOTAL SPENT */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  💳 Total Spent Balance
                </Label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSpentMode("reduce")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full font-bold transition-all",
                      spentMode === "reduce" ? "bg-red-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Reduce
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpentMode("set")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full font-bold transition-all",
                      spentMode === "set" ? "bg-red-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Set Exact
                  </button>
                </div>
              </div>

              {spentMode === "reduce" ? (
                <div className="space-y-2">
                  <Label htmlFor={`red-amt-${userId}`} className="text-xs font-mono text-slate-500">
                    Amount to deduct (GH₵):
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`red-amt-${userId}`}
                      type="number"
                      min={1}
                      value={reduceSpentBy}
                      onChange={(e) => setReduceSpentBy(e.target.value)}
                      placeholder="e.g. 50, 100"
                      className="h-9 text-sm rounded-xl font-mono"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={adjustSpent.isPending || !reduceSpentBy}
                      onClick={() => adjustSpent.mutate()}
                      className="shrink-0 font-bold rounded-xl bg-red-600 hover:bg-red-700"
                    >
                      Deduct Spent
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] font-mono font-semibold text-slate-400 self-center">Presets:</span>
                    {[50, 100, 200, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReduceSpentBy(String(preset))}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold bg-white border border-slate-200 hover:border-red-300 text-slate-700 transition-colors shadow-2xs"
                      >
                        -GH₵{preset}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={`set-amt-${userId}`} className="text-xs font-mono text-slate-500">
                    New exact cumulative total spent (GH₵):
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`set-amt-${userId}`}
                      type="number"
                      min={0}
                      value={targetSpent}
                      onChange={(e) => setTargetSpent(e.target.value)}
                      placeholder="e.g. 0 or 250"
                      className="h-9 text-sm rounded-xl font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={adjustSpent.isPending || targetSpent === ""}
                      onClick={() => adjustSpent.mutate()}
                      className="shrink-0 font-bold rounded-xl border-slate-200 text-slate-900 hover:bg-slate-100"
                    >
                      Set Balance
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: EDIT CREDITS & VERDICTS */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                🪙 Credits &amp; Verdicts/Scan
              </Label>

              <div className="space-y-1.5">
                <Label htmlFor={`amt-${userId}`} className="text-xs font-mono text-slate-500">
                  Credits to Add / Deduct:
                </Label>
                <Input
                  id={`amt-${userId}`}
                  type="number"
                  min={1}
                  max={10000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5"
                  className="h-9 text-sm rounded-xl font-mono"
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`verdicts-${userId}`} className="text-xs font-mono text-slate-500">
                    Verdicts per Scan:
                  </Label>
                  <span className="text-xs font-mono font-bold text-red-600 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200">
                    {verdicts || "1"} verdict{Number(verdicts) === 1 ? "" : "s"}/scan
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {packageList.map((pkg) => {
                    const vStr = String(pkg.max_verdicts);
                    const isSelected = verdicts === vStr;
                    return (
                      <button
                        key={pkg.id || pkg.name}
                        type="button"
                        onClick={() => setVerdicts(vStr)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-mono font-semibold transition-all border",
                          isSelected
                            ? "bg-red-600 text-white border-red-600 shadow-xs shadow-red-600/20"
                            : "bg-white border-slate-200 text-slate-700 hover:border-red-300"
                        )}
                      >
                        <span>{pkg.name}</span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold",
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {pkg.max_verdicts}v
                        </span>
                      </button>
                    );
                  })}
                </div>

                <Input
                  id={`verdicts-${userId}`}
                  type="number"
                  min={1}
                  max={50}
                  value={verdicts}
                  onChange={(e) => setVerdicts(e.target.value)}
                  placeholder="Custom verdicts count (e.g. 3, 5, 10...)"
                  className="h-8 text-xs font-mono rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  disabled={adjustCredits.isPending}
                  onClick={() => adjustCredits.mutate(1)}
                >
                  + Add Credits
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs"
                  disabled={adjustCredits.isPending}
                  onClick={() => adjustCredits.mutate(-1)}
                >
                  - Deduct Credits
                </Button>
              </div>
            </div>

            {/* Reason note */}
            <div className="space-y-1.5">
              <Label htmlFor={`why-${userId}`} className="text-xs font-mono text-slate-500">
                Audit Log Reason / Memo:
              </Label>
              <Input
                id={`why-${userId}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Manual top-up / Promotion / Dispute resolution"
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type PackageDraft = {
  id: string | null;
  name: string;
  slug: string;
  price_ghs: string;
  credits: string;
  perks: string;
  max_verdicts: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: string;
};
const emptyDraft: PackageDraft = {
  id: null,
  name: "",
  slug: "",
  price_ghs: "",
  credits: "",
  perks: "",
  max_verdicts: "2",
  is_active: true,
  is_popular: false,
  sort_order: "0",
};

function AdminSettingsManager() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(paymentSettingsQuery());
  const updateSettingsFn = useServerFn(updatePaymentSettings);

  const [draft, setDraft] = useState<{
    momo_number: string;
    recipient_name: string;
    network: string;
    instructions: string;
    registration_fee_ghs: string;
    developer_commission_rate: string;
    admin_commission_rate: string;
    default_partner_commission_rate: string;
  } | null>(null);

  const current = draft ?? {
    momo_number: settings?.momo_number ?? "",
    recipient_name: settings?.recipient_name ?? "",
    network: settings?.network ?? "MTN MoMo",
    instructions: settings?.instructions ?? "",
    registration_fee_ghs: String(settings?.registration_fee_ghs ?? 50),
    developer_commission_rate: String(settings?.developer_commission_rate ?? 15),
    admin_commission_rate: String(settings?.admin_commission_rate ?? 15),
    default_partner_commission_rate: String(settings?.default_partner_commission_rate ?? 10),
  };

  const save = useMutation({
    mutationFn: async () => {
      const number = current.momo_number.trim();
      const name = current.recipient_name.trim();
      const fee = Number(current.registration_fee_ghs) || 50;
      const devRate = Math.min(100, Math.max(0, Number(current.developer_commission_rate) || 15));
      const adminRate = Math.min(100, Math.max(0, Number(current.admin_commission_rate) || 15));
      const partnerRate = Math.min(100, Math.max(0, Number(current.default_partner_commission_rate) || 10));

      if (number.length < 6 || number.length > 30) throw new Error("Enter a valid payment phone number.");
      if (name.length < 2 || name.length > 80) throw new Error("Enter the recipient name.");

      const res = await updateSettingsFn({
        data: {
          momoNumber: number,
          recipientName: name,
          network: current.network.trim() || "MTN MoMo",
          instructions: current.instructions.trim(),
          registrationFeeGhs: fee,
          developerCommissionRate: devRate,
          adminCommissionRate: adminRate,
          defaultPartnerCommissionRate: partnerRate,
        },
      });

      return res;
    },
    onSuccess: async (res) => {
      setDraft(null);
      if (res?.settings) {
        queryClient.setQueryData(["payment-settings"], res.settings);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-daily-commission-snapshots"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
      ]);
      toast.success("Platform settings updated successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      className="grid max-w-2xl gap-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-red-600" />
          <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight font-sans">
            Platform Gateway &amp; Splits
          </h3>
        </div>
        <p className="mt-1 text-xs text-slate-500 font-normal">
          Configure commission percentages, payment gateway recipient credentials, and registration fees.
        </p>
      </div>

      {/* System Commission Splits */}
      <div className="rounded-2xl border border-red-200/80 bg-red-50/30 p-5 space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
          <Percent className="size-3.5" /> Commission Splits
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="dev-rate" className="text-xs font-mono font-bold text-slate-700">
              Dev Commission (%)
            </Label>
            <Input
              id="dev-rate"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={current.developer_commission_rate}
              onChange={(e) => setDraft({ ...current, developer_commission_rate: e.target.value })}
              className="rounded-xl font-mono bg-white"
            />
            <p className="text-[10px] font-mono text-slate-400">Dev dashboard tally.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-rate" className="text-xs font-mono font-bold text-slate-700">
              Admin Commission (%)
            </Label>
            <Input
              id="admin-rate"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={current.admin_commission_rate}
              onChange={(e) => setDraft({ ...current, admin_commission_rate: e.target.value })}
              className="rounded-xl font-mono bg-white"
            />
            <p className="text-[10px] font-mono text-slate-400">Admin dashboard tally.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partner-rate" className="text-xs font-mono font-bold text-slate-700">
              Partner Default (%)
            </Label>
            <Input
              id="partner-rate"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={current.default_partner_commission_rate}
              onChange={(e) => setDraft({ ...current, default_partner_commission_rate: e.target.value })}
              className="rounded-xl font-mono bg-white"
            />
            <p className="text-[10px] font-mono text-slate-400">New partner base rate.</p>
          </div>
        </div>
      </div>

      {/* Payment Gateway & Checkout Details */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
          <CreditCard className="size-3.5 text-red-600" /> MoMo Gateway Credentials
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="momo-number" className="text-xs font-mono font-bold text-slate-700">
              MoMo Payment Number
            </Label>
            <Input
              id="momo-number"
              value={current.momo_number}
              maxLength={30}
              onChange={(e) => setDraft({ ...current, momo_number: e.target.value })}
              className="rounded-xl font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recipient" className="text-xs font-mono font-bold text-slate-700">
              Recipient Account Name
            </Label>
            <Input
              id="recipient"
              value={current.recipient_name}
              maxLength={80}
              onChange={(e) => setDraft({ ...current, recipient_name: e.target.value })}
              className="rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="network" className="text-xs font-mono font-bold text-slate-700">
              Network / Method Label
            </Label>
            <Input
              id="network"
              value={current.network}
              maxLength={40}
              onChange={(e) => setDraft({ ...current, network: e.target.value })}
              className="rounded-xl font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-fee" className="text-xs font-mono font-bold text-slate-700">
              Registration Fee (GH₵)
            </Label>
            <Input
              id="reg-fee"
              type="number"
              min={0}
              step="1"
              value={current.registration_fee_ghs}
              onChange={(e) => setDraft({ ...current, registration_fee_ghs: e.target.value })}
              className="rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instructions" className="text-xs font-mono font-bold text-slate-700">
            Payment Instructions (displayed on payment modal)
          </Label>
          <Textarea
            id="instructions"
            rows={3}
            value={current.instructions}
            maxLength={300}
            onChange={(e) => setDraft({ ...current, instructions: e.target.value })}
            className="rounded-xl text-xs font-mono"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={save.isPending}
        className="w-fit rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-xs shadow-red-600/20"
      >
        {save.isPending ? "Saving changes…" : "Save Platform Settings"}
      </Button>
    </form>
  );
}

function MonetisationManager() {
  const queryClient = useQueryClient();
  const { data: packages } = useQuery(adminPackagesQuery());
  const [draft, setDraft] = useState<PackageDraft | null>(null);

  const save = useMutation({
    mutationFn: async (d: PackageDraft) => {
      const perks = d.perks
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const name = d.name.trim();
      const slug = d.slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const price_ghs = Number(d.price_ghs);
      const credits = Math.trunc(Number(d.credits));
      const is_active = d.is_active;
      const is_popular = d.is_popular;
      const sort_order = Math.trunc(Number(d.sort_order) || 0);
      const max_verdicts = Math.max(1, Math.trunc(Number(d.max_verdicts) || 1));

      const { error: err10 } = await supabase.rpc("admin_upsert_package" as never, {
        ...(d.id ? { _id: d.id } : {}),
        _name: name,
        _slug: slug,
        _price_ghs: price_ghs,
        _credits: credits,
        _perks: perks,
        _is_active: is_active,
        _is_popular: is_popular,
        _sort_order: sort_order,
        _max_verdicts: max_verdicts,
      } as never);

      if (!err10) return;

      if (!err10.message.includes("Could not find the function") && !err10.message.includes("schema cache")) {
        throw new Error(err10.message);
      }

      const { error: err9 } = await supabase.rpc("admin_upsert_package" as never, {
        ...(d.id ? { _id: d.id } : {}),
        _name: name,
        _slug: slug,
        _price_ghs: price_ghs,
        _credits: credits,
        _perks: perks,
        _is_active: is_active,
        _sort_order: sort_order,
        _max_verdicts: max_verdicts,
      } as never);

      if (!err9) {
        if (d.id) {
          await supabase.from("packages").update({ is_popular: is_popular }).eq("id", d.id);
        }
        return;
      }

      if (d.id) {
        const { error: directErr } = await supabase
          .from("packages")
          .update({
            name,
            slug,
            price_ghs,
            credits,
            perks: perks as never,
            is_active,
            is_popular,
            sort_order,
            max_verdicts,
          })
          .eq("id", d.id);
        if (directErr) throw new Error(directErr.message || err10.message);
      } else {
        const { error: directErr } = await supabase
          .from("packages")
          .insert({
            name,
            slug,
            price_ghs,
            credits,
            perks: perks as never,
            is_active,
            is_popular,
            sort_order,
            max_verdicts,
          });
        if (directErr) throw new Error(directErr.message || err10.message);
      }
    },
    onSuccess: async () => {
      setDraft(null);
      await queryClient.invalidateQueries();
      toast.success("Package saved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (p: PackageRow) => {
      const is_active = !p.is_active;

      const { error: err10 } = await supabase.rpc("admin_upsert_package" as never, {
        _id: p.id,
        _name: p.name,
        _slug: p.slug,
        _price_ghs: Number(p.price_ghs),
        _credits: p.credits,
        _perks: (p.perks as string[]) ?? [],
        _is_active: is_active,
        _is_popular: p.is_popular,
        _sort_order: p.sort_order,
        _max_verdicts: p.max_verdicts,
      } as never);

      if (!err10) return;

      if (!err10.message.includes("Could not find the function") && !err10.message.includes("schema cache")) {
        throw new Error(err10.message);
      }

      const { error: err9 } = await supabase.rpc("admin_upsert_package" as never, {
        _id: p.id,
        _name: p.name,
        _slug: p.slug,
        _price_ghs: Number(p.price_ghs),
        _credits: p.credits,
        _perks: (p.perks as string[]) ?? [],
        _is_active: is_active,
        _sort_order: p.sort_order,
        _max_verdicts: p.max_verdicts,
      } as never);

      if (!err9) return;

      const { error: directErr } = await supabase
        .from("packages")
        .update({ is_active: is_active })
        .eq("id", p.id);

      if (directErr) throw new Error(directErr.message || err10.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Package visibility updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("admin_delete_package", { _id: id });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Package removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight font-sans">
            Packages &amp; Tiers
          </h3>
          <p className="text-xs text-slate-500 font-mono">Configure price points, credit amounts, and scan power</p>
        </div>
        <Button
          size="sm"
          onClick={() => setDraft({ ...emptyDraft })}
          className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 shadow-xs shadow-red-600/20"
        >
          <Plus className="size-4" /> New Package
        </Button>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {(packages ?? []).length === 0 && (
          <p className="p-8 text-center text-sm font-mono text-slate-400">No packages created yet.</p>
        )}
        {(packages ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-slate-50/50">
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-2 text-base font-bold text-slate-950 font-sans">
                {p.name}
                {p.is_popular && (
                  <Badge className="bg-red-600 text-white font-mono font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full">
                    ⭐ POPULAR
                  </Badge>
                )}
                {!p.is_active && (
                  <Badge variant="secondary" className="font-mono text-[9px] px-2 py-0.5 rounded-full">
                    Hidden
                  </Badge>
                )}
              </p>
              <p className="text-xs font-mono text-slate-500">
                <strong className="text-slate-950 font-bold">{ghs(p.price_ghs)}</strong> · {p.credits} credits · {p.max_verdicts} verdicts/scan · slug <span className="text-slate-700 font-semibold">{p.slug}</span> · order {p.sort_order}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 pr-2">
                <Switch
                  checked={p.is_active}
                  onCheckedChange={() => toggle.mutate(p)}
                  aria-label={`Toggle ${p.name}`}
                />
                <span className="text-xs font-mono text-slate-500 font-semibold">Live</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-slate-200 text-xs font-semibold"
                onClick={() =>
                  setDraft({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price_ghs: String(p.price_ghs),
                    credits: String(p.credits),
                    perks: (((p.perks as string[]) ?? []) as string[]).join("\n"),
                    max_verdicts: String(p.max_verdicts),
                    is_active: p.is_active,
                    is_popular: p.is_popular,
                    sort_order: String(p.sort_order),
                  })
                }
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={remove.isPending}
                onClick={() => remove.mutate(p.id)}
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-semibold"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-2xl sm:rounded-3xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-950 font-sans">
              {draft?.id ? "Edit Package Tier" : "Create New Package Tier"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set the pricing, credit volume, verdict limits and promotional perks members see on the credits page.
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <form
              className="grid gap-4 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(draft);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-name" className="text-xs font-mono font-bold text-slate-700">Name</Label>
                  <Input
                    id="pkg-name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-slug" className="text-xs font-mono font-bold text-slate-700">Slug</Label>
                  <Input
                    id="pkg-slug"
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    placeholder="starter"
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-price" className="text-xs font-mono font-bold text-slate-700">Price (GH₵)</Label>
                  <Input
                    id="pkg-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.price_ghs}
                    onChange={(e) => setDraft({ ...draft, price_ghs: e.target.value })}
                    required
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-credits" className="text-xs font-mono font-bold text-slate-700">Credits</Label>
                  <Input
                    id="pkg-credits"
                    type="number"
                    min={1}
                    value={draft.credits}
                    onChange={(e) => setDraft({ ...draft, credits: e.target.value })}
                    required
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-order" className="text-xs font-mono font-bold text-slate-700">Display Order</Label>
                  <Input
                    id="pkg-order"
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-verdicts" className="text-xs font-mono font-bold text-slate-700">Verdicts per Screenshot</Label>
                  <Input
                    id="pkg-verdicts"
                    type="number"
                    min={1}
                    value={draft.max_verdicts}
                    onChange={(e) => setDraft({ ...draft, max_verdicts: e.target.value })}
                    required
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="pkg-active"
                    checked={draft.is_active}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                  />
                  <Label htmlFor="pkg-active" className="text-xs font-mono font-bold text-slate-700">Visible in store</Label>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="pkg-popular"
                    checked={draft.is_popular}
                    onCheckedChange={(v) => setDraft({ ...draft, is_popular: v })}
                  />
                  <Label htmlFor="pkg-popular" className="text-xs font-mono font-bold text-slate-700">⭐ Featured Badge</Label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-perks" className="text-xs font-mono font-bold text-slate-700">Perks (one per line)</Label>
                <Textarea
                  id="pkg-perks"
                  rows={4}
                  value={draft.perks}
                  onChange={(e) => setDraft({ ...draft, perks: e.target.value })}
                  placeholder={"Priority AI verdict engine\nFull match breakdown\nInstant Telegram alerts"}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
              <DialogFooter className="gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setDraft(null)} className="rounded-xl border-slate-200">
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">
                  {save.isPending ? "Saving…" : "Save Package"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
