-- ============================================================================
-- Migration: Partner Approval Flow & Gating
-- Ensures users who register via partner link wait on pending approval page,
-- admin reviews and approves in Admin Console, and approved partners unlock hub.
-- ============================================================================

-- 1. Ensure partner_applicant and registration_paid columns exist on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_applicant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_paid boolean DEFAULT false;

-- Ensure updated_at column exists on partner_applications
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Ensure RLS policies on partner_applications allow applicants to insert and view
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'partner_applications' AND policyname = 'Users read own application'
  ) THEN
    CREATE POLICY "Users read own application" ON public.partner_applications
      FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'partner_applications' AND policyname = 'Users insert own application'
  ) THEN
    CREATE POLICY "Users insert own application" ON public.partner_applications
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'partner_applications' AND policyname = 'Users update own application'
  ) THEN
    CREATE POLICY "Users update own application" ON public.partner_applications
      FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
  END IF;
END;
$$;

-- 3. Bulletproof register_partner_applicant RPC
DROP FUNCTION IF EXISTS public.register_partner_applicant(uuid, text);
DROP FUNCTION IF EXISTS public.register_partner_applicant(uuid);

CREATE OR REPLACE FUNCTION public.register_partner_applicant(_user_id UUID, _phone TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark profile as applicant (waives registration fee, flags as partner applicant)
  UPDATE public.profiles
  SET partner_applicant = true,
      registration_paid = true,
      phone = COALESCE(NULLIF(_phone, ''), phone),
      updated_at = now()
  WHERE id = _user_id;

  -- Ensure partner application is logged in pending queue for admin review
  INSERT INTO public.partner_applications (
    user_id,
    audience,
    motivation,
    payout_method,
    payout_details,
    status
  )
  VALUES (
    _user_id,
    'Partner link invite',
    'Registered via partner invitation link',
    'MTN MoMo',
    COALESCE(NULLIF(_phone, ''), 'Pending verification'),
    'pending'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = CASE WHEN partner_applications.status = 'approved' THEN 'approved' ELSE 'pending' END,
    payout_details = COALESCE(NULLIF(_phone, ''), partner_applications.payout_details);

  -- Crucial: Ensure partner role is NOT present yet (must wait for admin approval)
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'partner';
END;
$$;

REVOKE ALL ON FUNCTION public.register_partner_applicant(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.register_partner_applicant(UUID, TEXT) TO authenticated, service_role, anon;

-- 4. Update handle_new_user trigger so partner link signups NEVER auto-grant partner role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code TEXT;
  _ref UUID;
  _is_admin BOOLEAN := false;
  _is_applicant BOOLEAN := false;
  _phone_clean TEXT;
BEGIN
  LOOP
    _code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = _code);
  END LOOP;

  SELECT id INTO _ref FROM public.profiles
   WHERE referral_code = upper(NULLIF(NEW.raw_user_meta_data->>'referral_code', ''));

  _is_applicant := COALESCE(NEW.raw_user_meta_data->>'partner_applicant', '') IN ('true', '1', 't');
  _phone_clean := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '\D', '', 'g');

  IF _phone_clean IN ('0596842918', '233596842918', '596842918', '0552231466', '233552231466', '552231466')
     OR NEW.email LIKE '%596842918%'
     OR NEW.email LIKE '%552231466%'
  THEN
    _is_admin := true;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, phone, referral_code, referred_by,
    registration_paid, partner_applicant, credits
  ) VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    _code,
    _ref,
    CASE WHEN _is_admin OR _is_applicant THEN true ELSE false END,
    _is_applicant,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    partner_applicant = CASE WHEN _is_applicant THEN true ELSE profiles.partner_applicant END,
    registration_paid = CASE WHEN _is_applicant THEN true ELSE profiles.registration_paid END;

  -- Default member role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;

  -- Admin bootstrap
  IF _is_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'partner') ON CONFLICT DO NOTHING;
  END IF;

  -- Auto-create pending application for admin queue (NO partner role granted yet)
  IF _is_applicant AND NOT _is_admin THEN
    INSERT INTO public.partner_applications (
      user_id, audience, motivation, payout_method, payout_details, status
    ) VALUES (
      NEW.id,
      'Partner link invite',
      'Registered via partner invitation link',
      'MTN MoMo',
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), 'Pending verification'),
      'pending'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Bulletproof review_partner_application to ensure partner role is granted on approve
DROP FUNCTION IF EXISTS public.review_partner_application(uuid, boolean, text);

CREATE OR REPLACE FUNCTION public.review_partner_application(_application_id UUID, _approve BOOLEAN, _note TEXT DEFAULT NULL)
RETURNS public.partner_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _a public.partner_applications;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'FORBIDDEN: Admin role required'; END IF;

  SELECT * INTO _a FROM public.partner_applications WHERE id = _application_id FOR UPDATE;
  IF _a.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  UPDATE public.partner_applications
     SET status = CASE WHEN _approve THEN 'approved'::public.application_status ELSE 'rejected'::public.application_status END,
         admin_note = _note,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   WHERE id = _application_id
   RETURNING * INTO _a;

  IF _approve THEN
    -- Grant partner role
    INSERT INTO public.user_roles (user_id, role) VALUES (_a.user_id, 'partner') ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET registration_paid = true, updated_at = now() WHERE id = _a.user_id;
  ELSE
    -- Revoke partner role if was previously granted
    DELETE FROM public.user_roles WHERE user_id = _a.user_id AND role = 'partner';
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), CASE WHEN _approve THEN 'partner.approved' ELSE 'partner.rejected' END, 'partner_applications', _a.id, jsonb_build_object('note', _note));

  RETURN _a;
END;
$$;

REVOKE ALL ON FUNCTION public.review_partner_application(UUID, BOOLEAN, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_partner_application(UUID, BOOLEAN, TEXT) TO authenticated, service_role;

-- 6. Add partner_applications and user_roles to realtime if not present
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_applications;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;

-- 7. Reload schema cache
NOTIFY pgrst, 'reload schema';
