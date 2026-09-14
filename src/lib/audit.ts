import { supabase } from "@/integrations/supabase/client";

export interface LogAdminActionParams {
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}

/**
 * Records an admin action into the audit_logs table.
 * Uses the security-definer log_admin_action RPC primarily,
 * and falls back to direct table insertion.
 */
export async function logAdminAction({
  action,
  entity,
  entityId,
  meta,
}: LogAdminActionParams): Promise<void> {
  try {
    // 1. Primary: Database RPC (handles auth.uid() automatically and securely)
    const { error: rpcError } = await supabase.rpc("log_admin_action" as never, {
      _action: action,
      _entity: entity,
      _entity_id: entityId ?? null,
      _meta: meta ?? {},
    } as never);

    if (!rpcError) return;

    // 2. Direct table insert fallback
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_logs").insert({
      actor_id: user?.id ?? null,
      action,
      entity,
      entity_id: entityId ?? null,
      meta: (meta ?? {}) as never,
    });
  } catch (err) {
    console.warn("Audit log recording error:", err);
  }
}
