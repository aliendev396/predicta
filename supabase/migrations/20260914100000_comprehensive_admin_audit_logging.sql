-- ============================================================================
-- Migration: Comprehensive Admin Audit Logging
-- 1. Ensure authenticated Admins can insert into audit_logs directly & via RPC
-- 2. Provide public.log_admin_action helper function
-- 3. Enrich all admin action RPCs with self-explanatory, detailed metadata
-- ============================================================================

-- 1. RLS & Permissions for audit_logs
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

DROP POLICY IF EXISTS "Admins insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Helper RPC: public.log_admin_action
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action text,
  _entity text,
  _entity_id uuid DEFAULT NULL,
  _meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin privileges required to write audit log';
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), _action, _entity, _entity_id, COALESCE(_meta, '{}'::jsonb))
  RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_admin_action(text, text, uuid, jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, jsonb) TO authenticated, service_role;

-- 3. Enrich review_payment with member info & payment reference
CREATE OR REPLACE FUNCTION public.review_payment(_payment_id uuid, _approve boolean, _note text DEFAULT NULL::text)
RETURNS payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  _p public.payments; 
  _partner UUID; 
  _rate numeric;
  _pkg_credits integer := 0;
  _credits_to_grant integer := 0;
  _u_name text;
  _u_email text;
  _u_phone text;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;

  SELECT * INTO _p FROM public.payments WHERE id = _payment_id FOR UPDATE;
  IF _p.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF _p.status <> 'pending' THEN RAISE EXCEPTION 'ALREADY_REVIEWED'; END IF;

  SELECT full_name, email, phone INTO _u_name, _u_email, _u_phone FROM public.profiles WHERE id = _p.user_id;

  -- Determine credits from package table if package_id exists
  IF _p.package_id IS NOT NULL THEN
    SELECT COALESCE(pk.credits, 0) INTO _pkg_credits FROM public.packages pk WHERE pk.id = _p.package_id;
    _credits_to_grant := CASE WHEN _pkg_credits > 0 THEN _pkg_credits ELSE COALESCE(_p.credits, 0) END;
  ELSE
    _credits_to_grant := COALESCE(_p.credits, 0);
  END IF;

  UPDATE public.payments
     SET status = CASE WHEN _approve THEN 'approved'::public.payment_status ELSE 'rejected'::public.payment_status END,
         credits = CASE WHEN _credits_to_grant > 0 THEN _credits_to_grant ELSE credits END,
         admin_note = _note, 
         reviewed_by = auth.uid(), 
         reviewed_at = now()
   WHERE id = _payment_id RETURNING * INTO _p;

  IF _approve THEN
    IF _p.kind = 'registration' AND _p.package_id IS NULL THEN
      UPDATE public.profiles
         SET registration_paid = true, registration_paid_at = now(), updated_at = now()
       WHERE id = _p.user_id;
    ELSE
      -- Package purchase or credit grant:
      PERFORM set_config('app.credit_ctx', 'trusted', true);
      UPDATE public.profiles 
         SET credits = COALESCE(credits, 0) + _credits_to_grant, 
             registration_paid = true,
             updated_at = now() 
       WHERE id = _p.user_id;
      PERFORM set_config('app.credit_ctx', '', true);

      INSERT INTO public.credit_transactions (user_id, delta, reason, ref_id)
      VALUES (_p.user_id, _credits_to_grant, 'Package purchase approved', _p.id);
    END IF;

    SELECT referred_by INTO _partner FROM public.profiles WHERE id = _p.user_id;
    IF _partner IS NOT NULL THEN
      SELECT COALESCE(commission_rate, 10) INTO _rate FROM public.profiles WHERE id = _partner;
      INSERT INTO public.partner_commissions (partner_id, referred_user_id, payment_id, amount_ghs)
      VALUES (_partner, _p.user_id, _p.id, round(_p.amount_ghs * (COALESCE(_rate,10) / 100.0), 2));
    END IF;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    CASE WHEN _approve THEN 'payment.approved' ELSE 'payment.rejected' END,
    'payments',
    _p.id,
    jsonb_build_object(
      'kind', _p.kind,
      'credits', _credits_to_grant,
      'amount_ghs', _p.amount_ghs,
      'reference', _p.reference,
      'method', _p.method,
      'member_name', _u_name,
      'member_email', _u_email,
      'member_phone', _u_phone,
      'note', _note
    )
  );

  RETURN _p;
END;
$function$;

REVOKE ALL ON FUNCTION public.review_payment(uuid, boolean, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_payment(uuid, boolean, text) TO authenticated, service_role;

-- 4. Enrich admin_adjust_credits with member info
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  _user_id uuid,
  _delta integer,
  _reason text DEFAULT NULL::text,
  _max_verdicts integer DEFAULT NULL::integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _remaining INTEGER;
  _u_name text;
  _u_email text;
  _u_phone text;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF _delta IS NULL OR _delta = 0 OR abs(_delta) > 10000 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;

  SELECT full_name, email, phone INTO _u_name, _u_email, _u_phone FROM public.profiles WHERE id = _user_id;

  PERFORM set_config('app.credit_ctx', 'trusted', true);
  UPDATE public.profiles
     SET credits = GREATEST(0, credits + _delta),
         max_verdicts = CASE 
           WHEN _max_verdicts IS NOT NULL AND _max_verdicts >= 1 THEN _max_verdicts 
           ELSE COALESCE(max_verdicts, 2) 
         END,
         updated_at = now()
   WHERE id = _user_id
   RETURNING credits INTO _remaining;
  PERFORM set_config('app.credit_ctx', '', true);

  IF _remaining IS NULL THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  INSERT INTO public.credit_transactions (user_id, delta, reason)
  VALUES (_user_id, _delta, COALESCE(NULLIF(_reason,''), CASE WHEN _delta > 0 THEN 'Admin credit grant' ELSE 'Admin credit adjustment' END));

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'credits.adjusted',
    'profiles',
    _user_id,
    jsonb_build_object(
      'delta', _delta,
      'reason', _reason,
      'balance', _remaining,
      'max_verdicts', _max_verdicts,
      'member_name', _u_name,
      'member_email', _u_email,
      'member_phone', _u_phone
    )
  );

  RETURN _remaining;
END;
$$;

-- 5. Enrich admin_set_partner with member info
CREATE OR REPLACE FUNCTION public.admin_set_partner(_user_id uuid, _make boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _u_name text;
  _u_email text;
  _u_phone text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id) THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  SELECT full_name, email, phone INTO _u_name, _u_email, _u_phone FROM public.profiles WHERE id = _user_id;

  IF _make THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'partner') ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'partner';
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    CASE WHEN _make THEN 'partner.added' ELSE 'partner.removed' END,
    'user_roles',
    _user_id,
    jsonb_build_object(
      'status', CASE WHEN _make THEN 'granted' ELSE 'revoked' END,
      'member_name', _u_name,
      'member_email', _u_email,
      'member_phone', _u_phone
    )
  );

  RETURN _make;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_partner(uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_partner(uuid, boolean) TO authenticated, service_role;

-- 6. Enrich review_partner_application with applicant info
CREATE OR REPLACE FUNCTION public.review_partner_application(
  _application_id UUID,
  _approve BOOLEAN,
  _note TEXT DEFAULT NULL
)
RETURNS public.partner_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _a public.partner_applications;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin privileges required';
  END IF;

  SELECT * INTO _a FROM public.partner_applications WHERE id = _application_id FOR UPDATE;
  IF _a.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND: Application not found'; END IF;

  UPDATE public.partner_applications
     SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
         admin_note = _note,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   WHERE id = _application_id
   RETURNING * INTO _a;

  IF _approve THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_a.user_id, 'partner') ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET registration_paid = true, updated_at = now() WHERE id = _a.user_id;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _a.user_id AND role = 'partner';
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    CASE WHEN _approve THEN 'partner.approved' ELSE 'partner.rejected' END,
    'partner_applications',
    _a.id,
    jsonb_build_object(
      'applicant_name', _a.full_name,
      'applicant_email', _a.email,
      'applicant_phone', _a.phone,
      'audience', _a.audience,
      'payout_method', _a.payout_method,
      'note', _note
    )
  );

  RETURN _a;
END;
$$;

REVOKE ALL ON FUNCTION public.review_partner_application(UUID, BOOLEAN, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_partner_application(UUID, BOOLEAN, TEXT) TO authenticated, service_role;

-- 7. Enrich admin_set_commission_rate with partner name and rate comparison
CREATE OR REPLACE FUNCTION public.admin_set_commission_rate(_user_id uuid, _rate numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_rate numeric;
  _p_name text;
  _p_email text;
  _p_phone text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin role required';
  END IF;

  IF _rate IS NULL OR _rate < 0 OR _rate > 100 THEN
    RAISE EXCEPTION 'INVALID_RATE: Commission must be between 0 and 100';
  END IF;

  SELECT commission_rate, full_name, email, phone INTO _old_rate, _p_name, _p_email, _p_phone
  FROM public.profiles WHERE id = _user_id;

  UPDATE public.profiles
  SET commission_rate = _rate, updated_at = now()
  WHERE id = _user_id;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'partner.commission_rate_set',
    'profiles',
    _user_id,
    jsonb_build_object(
      'new_rate', _rate,
      'old_rate', _old_rate,
      'partner_name', _p_name,
      'partner_email', _p_email,
      'partner_phone', _p_phone
    )
  );

  RETURN _rate;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_commission_rate(uuid, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_commission_rate(uuid, numeric) TO authenticated, service_role;

-- 8. Enrich admin_clear_partner_payout with partner details
CREATE OR REPLACE FUNCTION public.admin_clear_partner_payout(
  _user_id uuid,
  _note text DEFAULT NULL
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rate numeric;
  _last_cleared timestamptz;
  _unpaid_rev numeric;
  _unpaid_comm numeric;
  _t timestamptz := now();
  _p_name text;
  _p_email text;
  _p_phone text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT commission_rate, payout_cleared_at, full_name, email, phone
    INTO _rate, _last_cleared, _p_name, _p_email, _p_phone
    FROM public.profiles
   WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  _rate := COALESCE(_rate, 10);

  SELECT COALESCE(sum(pay.amount_ghs), 0)
    INTO _unpaid_rev
    FROM public.payments pay
    JOIN public.profiles prof ON prof.id = pay.user_id
   WHERE prof.referred_by = _user_id
     AND pay.status = 'approved'
     AND (_last_cleared IS NULL OR pay.created_at > _last_cleared);

  _unpaid_comm := round(_unpaid_rev * (_rate / 100.0), 2);

  IF _unpaid_comm > 0 THEN
    INSERT INTO public.partner_payouts (partner_id, amount_ghs, cleared_at, cleared_by, note)
    VALUES (_user_id, _unpaid_comm, _t, auth.uid(), _note);
  END IF;

  UPDATE public.profiles SET payout_cleared_at = _t, updated_at = now() WHERE id = _user_id;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'partner.payout_cleared',
    'profiles',
    _user_id,
    jsonb_build_object(
      'amount_ghs', _unpaid_comm,
      'cleared_at', _t,
      'note', _note,
      'partner_name', _p_name,
      'partner_email', _p_email,
      'partner_phone', _p_phone
    )
  );

  RETURN _t;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_clear_partner_payout(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_clear_partner_payout(uuid, text) TO authenticated, service_role;

-- 9. Enrich admin_delete_package with package details
CREATE OR REPLACE FUNCTION public.admin_delete_package(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _p_name text;
  _p_price numeric;
  _p_credits integer;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  
  SELECT name, price_ghs, credits INTO _p_name, _p_price, _p_credits
  FROM public.packages WHERE id = _id;

  IF EXISTS (SELECT 1 FROM public.payments WHERE package_id = _id) THEN
    UPDATE public.packages SET is_active = false WHERE id = _id;
  ELSE
    DELETE FROM public.packages WHERE id = _id;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'package.deleted',
    'packages',
    _id,
    jsonb_build_object(
      'name', _p_name,
      'price_ghs', _p_price,
      'credits', _p_credits
    )
  );
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_package(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_package(uuid) TO authenticated, service_role;

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
