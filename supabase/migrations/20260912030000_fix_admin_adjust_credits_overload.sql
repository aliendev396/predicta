-- Fix admin_adjust_credits schema overload definitions & sync my_verdict_limit in Supabase PostgreSQL

-- 1. Ensure max_verdicts columns exist on profiles & packages tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_verdicts integer DEFAULT 2;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS max_verdicts integer NOT NULL DEFAULT 2;

-- 2. Drop any conflicting function signatures
DROP FUNCTION IF EXISTS public.admin_adjust_credits(uuid, integer, text);
DROP FUNCTION IF EXISTS public.admin_adjust_credits(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.admin_adjust_credits(uuid, integer, text, integer);

-- 3. Canonical 4-parameter function: (_user_id, _delta, _reason, _max_verdicts)
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
DECLARE _remaining INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF _delta IS NULL OR _delta = 0 OR abs(_delta) > 10000 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;

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
  VALUES (auth.uid(), 'credits.adjusted', 'profiles', _user_id, jsonb_build_object('delta', _delta, 'reason', _reason, 'balance', _remaining, 'max_verdicts', _max_verdicts));

  RETURN _remaining;
END;
$$;

-- 4. 3-parameter overload fallback: (_user_id, _delta, _max_verdicts)
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  _user_id uuid,
  _delta integer,
  _max_verdicts integer
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.admin_adjust_credits(_user_id, _delta, NULL::text, _max_verdicts);
$$;

GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, integer) TO authenticated, service_role;

-- 5. Bulletproof my_verdict_limit function: Returns maximum verdict allowance set by admin / package
CREATE OR REPLACE FUNCTION public.my_verdict_limit()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    1,
    COALESCE(
      -- 1. Check latest approved package payment's max_verdicts
      (SELECT pk.max_verdicts
       FROM public.payments pm
       JOIN public.packages pk ON pk.id = pm.package_id
       WHERE pm.user_id = auth.uid() AND pm.status = 'approved' AND pk.max_verdicts IS NOT NULL
       ORDER BY pm.reviewed_at DESC NULLS LAST, pm.created_at DESC
       LIMIT 1),
      -- 2. Check profile-level max_verdicts allocated by admin
      (SELECT p.max_verdicts FROM public.profiles p WHERE p.id = auth.uid() AND p.max_verdicts IS NOT NULL),
      -- 3. Default fallback
      2
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.my_verdict_limit() TO authenticated, service_role;
