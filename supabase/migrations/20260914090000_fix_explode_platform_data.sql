-- ============================================================================
-- Migration: Fix explode_platform_data RPC
-- Re-creates the function to ensure it's in the schema cache.
-- ============================================================================

DROP FUNCTION IF EXISTS public.explode_platform_data();

CREATE OR REPLACE FUNCTION public.explode_platform_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _analyses_count     integer;
  _payments_count     integer;
  _commissions_count  integer;
  _applications_count integer;
  _result             jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin role required';
  END IF;

  -- Capture counts before deletion
  SELECT count(*) INTO _analyses_count     FROM public.analyses;
  SELECT count(*) INTO _payments_count     FROM public.payments;
  SELECT count(*) INTO _commissions_count  FROM public.partner_commissions;
  SELECT count(*) INTO _applications_count FROM public.partner_applications;

  -- Wipe transactional data (keep users, profiles, packages, payment settings)
  DELETE FROM public.partner_commissions  WHERE id IS NOT NULL;
  DELETE FROM public.credit_transactions  WHERE id IS NOT NULL;
  DELETE FROM public.analyses             WHERE id IS NOT NULL;
  DELETE FROM public.payments             WHERE id IS NOT NULL;
  DELETE FROM public.partner_applications WHERE id IS NOT NULL;
  DELETE FROM public.audit_logs           WHERE id IS NOT NULL;

  -- Reset user credits and registration status
  PERFORM set_config('app.credit_ctx', 'trusted', true);
  UPDATE public.profiles
     SET credits              = 0,
         registration_paid    = false,
         registration_paid_at = NULL,
         payout_cleared_at    = now(),
         payout_requested_at  = NULL,
         updated_at           = now()
   WHERE id IS NOT NULL;
  PERFORM set_config('app.credit_ctx', '', true);

  _result := jsonb_build_object(
    'analyses',     _analyses_count,
    'payments',     _payments_count,
    'commissions',  _commissions_count,
    'applications', _applications_count
  );

  -- Audit log (re-insert since we just cleared it)
  INSERT INTO public.audit_logs (actor_id, action, entity, meta)
  VALUES (auth.uid(), 'platform.exploded', 'platform', _result);

  RETURN _result;
END;
$$;

REVOKE ALL ON FUNCTION public.explode_platform_data() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.explode_platform_data() TO authenticated, service_role;

-- Reload PostgREST schema cache so the function is immediately available
NOTIFY pgrst, 'reload schema';
