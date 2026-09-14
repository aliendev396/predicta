-- ============================================================================
-- Migration: Fix admin_set_commission_rate RPC & Profile Admin Update Policy
-- Ensures admin can update partner commission percentage without schema cache errors.
-- ============================================================================

-- 1. Ensure commission_rate column exists on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 10;

-- 2. Drop existing function to ensure clean recreation
DROP FUNCTION IF EXISTS public.admin_set_commission_rate(uuid, numeric);

-- 3. Create admin_set_commission_rate RPC
CREATE OR REPLACE FUNCTION public.admin_set_commission_rate(_user_id uuid, _rate numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin role required';
  END IF;

  IF _rate IS NULL OR _rate < 0 OR _rate > 100 THEN
    RAISE EXCEPTION 'INVALID_RATE: Commission must be between 0 and 100';
  END IF;

  UPDATE public.profiles
  SET commission_rate = _rate, updated_at = now()
  WHERE id = _user_id;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'partner.commission_rate', 'profiles', _user_id, jsonb_build_object('rate', _rate));

  RETURN _rate;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_commission_rate(uuid, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_commission_rate(uuid, numeric) TO authenticated, service_role;

-- 4. Add RLS policy allowing Admins to update profiles (allows direct table fallback)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END;
$$;

-- 5. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
