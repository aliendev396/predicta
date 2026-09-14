-- ============================================================================
-- Migration: Partner Payout Request
-- Adds payout_requested_at column so partners can signal they want to be paid,
-- and admin sees pending requests sorted to top of Partner Payouts tab.
-- ============================================================================

-- 1. Add payout_requested_at to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payout_requested_at timestamptz DEFAULT NULL;

-- 2. RPC: Partner requests a payout (sets flag on their profile)
CREATE OR REPLACE FUNCTION public.request_partner_payout()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'partner') THEN
    RAISE EXCEPTION 'FORBIDDEN: Partner role required';
  END IF;

  UPDATE public.profiles
  SET payout_requested_at = now(), updated_at = now()
  WHERE id = auth.uid();

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'partner.payout_requested', 'profiles', auth.uid(),
          jsonb_build_object('requested_at', now()));
END;
$$;

REVOKE ALL ON FUNCTION public.request_partner_payout() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_partner_payout() TO authenticated, service_role;

-- 3. RPC: Partner cancels their payout request
CREATE OR REPLACE FUNCTION public.cancel_partner_payout_request()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET payout_requested_at = NULL, updated_at = now()
  WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_partner_payout_request() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cancel_partner_payout_request() TO authenticated, service_role;

-- 4. Patch admin_clear_partner_payout to also reset payout_requested_at
DROP FUNCTION IF EXISTS public.admin_clear_partner_payout(uuid, text);

CREATE OR REPLACE FUNCTION public.admin_clear_partner_payout(_user_id uuid, _note text DEFAULT NULL::text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _t timestamptz := now();
  _rate numeric;
  _unpaid_rev numeric;
  _unpaid_comm numeric;
  _last_cleared timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;

  SELECT COALESCE(commission_rate, 10), payout_cleared_at
    INTO _rate, _last_cleared
    FROM public.profiles
   WHERE id = _user_id;

  SELECT COALESCE(sum(pay.amount_ghs), 0)
    INTO _unpaid_rev
    FROM public.profiles r
    JOIN public.payments pay ON pay.user_id = r.id
   WHERE r.referred_by = _user_id AND pay.status = 'approved'
     AND (_last_cleared IS NULL OR pay.created_at > _last_cleared);

  _unpaid_comm := round(_unpaid_rev * (_rate / 100.0), 2);

  IF _unpaid_comm > 0 THEN
    INSERT INTO public.partner_payouts (partner_id, amount_ghs, cleared_at, cleared_by, note)
    VALUES (_user_id, _unpaid_comm, _t, auth.uid(), _note);
  END IF;

  -- Reset both payout_cleared_at AND payout_requested_at
  UPDATE public.profiles
  SET payout_cleared_at = _t,
      payout_requested_at = NULL,
      updated_at = now()
  WHERE id = _user_id;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'partner.payout_cleared', 'profiles', _user_id,
          jsonb_build_object('amount_ghs', _unpaid_comm, 'cleared_at', _t, 'note', _note));

  RETURN _t;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_clear_partner_payout(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_clear_partner_payout(uuid, text) TO authenticated, service_role;

-- 5. Rebuild admin_partner_list to include payout_requested_at
DROP FUNCTION IF EXISTS public.admin_partner_list(text);

CREATE OR REPLACE FUNCTION public.admin_partner_list(_search text DEFAULT NULL::text)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  referral_code text,
  commission_rate numeric,
  payout_cleared_at timestamptz,
  payout_requested_at timestamptz,
  referral_count integer,
  revenue_ghs numeric,
  commissions_ghs numeric,
  lifetime_revenue_ghs numeric,
  lifetime_commissions_ghs numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id,
         p.email,
         p.full_name,
         p.referral_code,
         COALESCE(p.commission_rate, 10) AS commission_rate,
         p.payout_cleared_at,
         p.payout_requested_at,
         (SELECT count(*)::int FROM public.profiles c WHERE c.referred_by = p.id) AS referral_count,
         -- Unpaid revenue since last clearance
         (SELECT COALESCE(sum(pay.amount_ghs), 0)
            FROM public.profiles r
            JOIN public.payments pay ON pay.user_id = r.id
           WHERE r.referred_by = p.id AND pay.status = 'approved'
             AND (p.payout_cleared_at IS NULL OR pay.created_at > p.payout_cleared_at)) AS revenue_ghs,
         -- Unpaid commissions since last clearance
         round(
           (SELECT COALESCE(sum(pay.amount_ghs), 0)
              FROM public.profiles r
              JOIN public.payments pay ON pay.user_id = r.id
             WHERE r.referred_by = p.id AND pay.status = 'approved'
               AND (p.payout_cleared_at IS NULL OR pay.created_at > p.payout_cleared_at)) * COALESCE(p.commission_rate, 10) / 100.0,
           2
         ) AS commissions_ghs,
         -- Lifetime revenue (all-time)
         (SELECT COALESCE(sum(pay.amount_ghs), 0)
            FROM public.profiles r
            JOIN public.payments pay ON pay.user_id = r.id
           WHERE r.referred_by = p.id AND pay.status = 'approved') AS lifetime_revenue_ghs,
         -- Lifetime commissions (all-time)
         round(
           (SELECT COALESCE(sum(pay.amount_ghs), 0)
              FROM public.profiles r
              JOIN public.payments pay ON pay.user_id = r.id
             WHERE r.referred_by = p.id AND pay.status = 'approved') * COALESCE(p.commission_rate, 10) / 100.0,
           2
         ) AS lifetime_commissions_ghs
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'partner'
   WHERE public.has_role(auth.uid(), 'admin')
     AND (
       _search IS NULL
       OR _search = ''
       OR p.email ILIKE '%' || _search || '%'
       OR COALESCE(p.full_name, '') ILIKE '%' || _search || '%'
       OR p.referral_code ILIKE '%' || _search || '%'
     )
   -- Sort: requested payouts first, then by date desc
   ORDER BY (p.payout_requested_at IS NOT NULL) DESC, p.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_partner_list(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_partner_list(text) TO authenticated, service_role;

-- 6. Also update partner_stats to include whether a request is pending
CREATE OR REPLACE FUNCTION public.partner_stats(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT id,
           COALESCE(commission_rate, 10) AS rate,
           payout_cleared_at,
           payout_requested_at
    FROM public.profiles
    WHERE id = _user_id
  ),
  rev AS (
    SELECT
      COALESCE(sum(pay.amount_ghs), 0) AS lifetime_revenue,
      COALESCE(sum(CASE WHEN me.payout_cleared_at IS NULL OR pay.created_at > me.payout_cleared_at THEN pay.amount_ghs ELSE 0 END), 0) AS unpaid_revenue
    FROM public.profiles p
    CROSS JOIN me
    JOIN public.payments pay ON pay.user_id = p.id
    WHERE p.referred_by = me.id AND pay.status = 'approved'
  )
  SELECT jsonb_build_object(
    'registrations', (SELECT count(*) FROM public.profiles WHERE referred_by = (SELECT id FROM me)),
    'revenue_ghs', (SELECT unpaid_revenue FROM rev),
    'commissions_ghs', round((SELECT unpaid_revenue FROM rev) * (SELECT rate FROM me) / 100.0, 2),
    'lifetime_revenue_ghs', (SELECT lifetime_revenue FROM rev),
    'lifetime_commissions_ghs', round((SELECT lifetime_revenue FROM rev) * (SELECT rate FROM me) / 100.0, 2),
    'commission_rate', (SELECT rate FROM me),
    'payout_requested_at', (SELECT payout_requested_at FROM me)
  );
$$;

REVOKE ALL ON FUNCTION public.partner_stats(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.partner_stats(uuid) TO authenticated, service_role;
