-- ============================================================================
-- Migration: Admin Update Payment Settings & Commission Rates
-- Ensures payment_settings columns exist, fixes RLS, and creates a reliable RPC
-- ============================================================================

-- 1. Ensure commission rate columns exist on payment_settings
ALTER TABLE public.payment_settings 
  ADD COLUMN IF NOT EXISTS developer_commission_rate numeric NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS admin_commission_rate numeric NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS default_partner_commission_rate numeric NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS registration_fee_ghs numeric NOT NULL DEFAULT 50;

-- 2. Ensure initial row exists
INSERT INTO public.payment_settings (
  id,
  momo_number,
  recipient_name,
  network,
  instructions,
  registration_fee_ghs,
  developer_commission_rate,
  admin_commission_rate,
  default_partner_commission_rate
)
VALUES (
  true,
  '0551234567',
  'PREDICTA Ghana',
  'MTN MoMo',
  'Send the exact package amount, then submit your MoMo name and reference for approval.',
  50,
  15,
  15,
  10
)
ON CONFLICT (id) DO NOTHING;

-- 3. Fix RLS policies on payment_settings
DROP POLICY IF EXISTS "Admins update payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Admins insert payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Admins manage payment settings" ON public.payment_settings;

CREATE POLICY "Admins manage payment settings" ON public.payment_settings
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.admin_bootstrap_emails b ON lower(b.email) = lower(p.email)
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.admin_bootstrap_emails b ON lower(b.email) = lower(p.email)
      WHERE p.id = auth.uid()
    )
  );

-- 4. Create dedicated RPC for updating payment settings & live commission rates
CREATE OR REPLACE FUNCTION public.admin_update_payment_settings(
  _momo_number text,
  _recipient_name text,
  _network text,
  _instructions text,
  _registration_fee_ghs numeric,
  _developer_commission_rate numeric,
  _admin_commission_rate numeric,
  _default_partner_commission_rate numeric
)
RETURNS public.payment_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _res public.payment_settings;
  _is_admin boolean;
BEGIN
  _is_admin := public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.admin_bootstrap_emails b ON lower(b.email) = lower(p.email)
    WHERE p.id = auth.uid()
  );
  
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin privileges required';
  END IF;

  INSERT INTO public.payment_settings (
    id,
    momo_number,
    recipient_name,
    network,
    instructions,
    registration_fee_ghs,
    developer_commission_rate,
    admin_commission_rate,
    default_partner_commission_rate,
    updated_at
  )
  VALUES (
    true,
    COALESCE(NULLIF(trim(_momo_number), ''), '0551234567'),
    COALESCE(NULLIF(trim(_recipient_name), ''), 'PREDICTA Ghana'),
    COALESCE(NULLIF(trim(_network), ''), 'MTN MoMo'),
    COALESCE(_instructions, ''),
    GREATEST(0, COALESCE(_registration_fee_ghs, 50)),
    LEAST(100, GREATEST(0, COALESCE(_developer_commission_rate, 15))),
    LEAST(100, GREATEST(0, COALESCE(_admin_commission_rate, 15))),
    LEAST(100, GREATEST(0, COALESCE(_default_partner_commission_rate, 10))),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    momo_number = EXCLUDED.momo_number,
    recipient_name = EXCLUDED.recipient_name,
    network = EXCLUDED.network,
    instructions = EXCLUDED.instructions,
    registration_fee_ghs = EXCLUDED.registration_fee_ghs,
    developer_commission_rate = EXCLUDED.developer_commission_rate,
    admin_commission_rate = EXCLUDED.admin_commission_rate,
    default_partner_commission_rate = EXCLUDED.default_partner_commission_rate,
    updated_at = now()
  RETURNING * INTO _res;

  -- Update today's live snapshot with the newly configured commission rates
  UPDATE public.daily_commission_snapshots
  SET
    developer_commission_rate = _res.developer_commission_rate,
    admin_commission_rate = _res.admin_commission_rate,
    default_partner_commission_rate = _res.default_partner_commission_rate,
    dev_commission_ghs = round(revenue_ghs * (_res.developer_commission_rate / 100.0), 2),
    admin_commission_ghs = round(revenue_ghs * (_res.admin_commission_rate / 100.0), 2),
    updated_at = now()
  WHERE date = CURRENT_DATE;

  -- Log action in audit logs
  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'settings.updated',
    'payment_settings',
    'true',
    jsonb_build_object(
      'momo_number', _res.momo_number,
      'recipient_name', _res.recipient_name,
      'network', _res.network,
      'registration_fee_ghs', _res.registration_fee_ghs,
      'developer_commission_rate', _res.developer_commission_rate,
      'admin_commission_rate', _res.admin_commission_rate,
      'default_partner_commission_rate', _res.default_partner_commission_rate
    )
  );

  RETURN _res;
END;
$$;

-- 5. Update admin_stats RPC to ensure accurate total revenue and bootstrap admin support
CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _r JSONB;
  _is_admin boolean;
BEGIN
  _is_admin := public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.admin_bootstrap_emails b ON lower(b.email) = lower(p.email)
    WHERE p.id = auth.uid()
  );

  IF NOT _is_admin THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin access required';
  END IF;

  SELECT jsonb_build_object(
    'members', (SELECT count(*) FROM public.profiles),
    'analyses', (SELECT count(*) FROM public.analyses),
    'pending_payments', (SELECT count(*) FROM public.payments WHERE status='pending'),
    'partners', (SELECT count(*) FROM public.user_roles WHERE role='partner'),
    'pending_partners', (SELECT count(*) FROM public.partner_applications WHERE status='pending'),
    'revenue_ghs', (SELECT COALESCE(sum(amount_ghs), 0) FROM public.payments WHERE status='approved')
  ) INTO _r;
  RETURN _r;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';

