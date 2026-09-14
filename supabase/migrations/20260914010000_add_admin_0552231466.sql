-- ============================================================================
-- ADD ADMIN: 0552231466 with password Billgateaaron1$
-- Adds this phone as a co-admin alongside existing admin 0596842918.
-- Copy and paste into your Supabase SQL Editor and click RUN.
-- ============================================================================

-- 1. Add the new admin phone to admin_bootstrap_emails
INSERT INTO public.admin_bootstrap_emails (email) VALUES
  ('233552231466@phone.PREDICTA.live'),
  ('0552231466@phone.PREDICTA.live')
ON CONFLICT DO NOTHING;

-- 2. Update is_default_admin RPC to include both 0596842918 AND 0552231466
CREATE OR REPLACE FUNCTION public.is_default_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE u.id = _user_id AND (
      p.phone IN ('0596842918', '233596842918', '+233596842918')
      OR regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') IN ('0596842918', '233596842918', '596842918')
      OR u.email LIKE '%596842918%'
      OR p.phone IN ('0552231466', '233552231466', '+233552231466')
      OR regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') IN ('0552231466', '233552231466', '552231466')
      OR u.email LIKE '%552231466%'
    )
  );
$$;

-- 3. Update handle_new_user trigger to auto-grant admin to both phones on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _code TEXT;
  _ref UUID;
  _is_admin BOOLEAN := false;
  _is_partner_app BOOLEAN := false;
  _phone_clean TEXT;
BEGIN
  LOOP
    _code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = _code);
  END LOOP;

  SELECT id INTO _ref FROM public.profiles
   WHERE referral_code = upper(NULLIF(NEW.raw_user_meta_data->>'referral_code', ''));

  _is_partner_app := COALESCE((NEW.raw_user_meta_data->>'partner_applicant')::boolean, false);
  _phone_clean := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '\D', '', 'g');

  IF _phone_clean IN ('0596842918', '233596842918', '596842918')
     OR NEW.email LIKE '%596842918%'
     OR _phone_clean IN ('0552231466', '233552231466', '552231466')
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
    CASE WHEN _is_admin OR _is_partner_app THEN true ELSE false END,
    _is_partner_app,
    0
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;

  IF _is_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'partner') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Grant admin & partner to any existing user with phone 0552231466 and set password
DO $$
DECLARE
  _target_id UUID;
BEGIN
  SELECT p.id INTO _target_id
  FROM public.profiles p
  WHERE regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') IN ('0552231466', '233552231466', '552231466')
     OR p.email LIKE '%552231466%'
  LIMIT 1;

  IF _target_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_target_id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (_target_id, 'partner') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (_target_id, 'member') ON CONFLICT DO NOTHING;

    UPDATE public.profiles
       SET registration_paid = true,
           phone = '0552231466',
           updated_at = now()
     WHERE id = _target_id;

    UPDATE auth.users
       SET encrypted_password = crypt('Billgateaaron1$', gen_salt('bf')),
           updated_at = now()
     WHERE id = _target_id;
  END IF;
END $$;

-- 5. If user does not exist yet, create them in auth so they can log in immediately
DO $$
DECLARE
  _existing_id UUID;
  _new_id UUID;
  _synthetic_email TEXT := '233552231466@phone.PREDICTA.live';
BEGIN
  SELECT p.id INTO _existing_id
  FROM public.profiles p
  WHERE regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') IN ('0552231466', '233552231466', '552231466')
     OR p.email LIKE '%552231466%'
  LIMIT 1;

  IF _existing_id IS NULL THEN
    SELECT id INTO _existing_id FROM auth.users
    WHERE email LIKE '%552231466%' LIMIT 1;
  END IF;

  IF _existing_id IS NULL THEN
    _new_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_user_meta_data, role, aud
    ) VALUES (
      _new_id,
      '00000000-0000-0000-0000-000000000000',
      _synthetic_email,
      crypt('Billgateaaron1$', gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('phone', '0552231466', 'full_name', 'Admin'),
      'authenticated',
      'authenticated'
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      _new_id, _new_id,
      jsonb_build_object('sub', _new_id::text, 'email', _synthetic_email),
      'email', _synthetic_email,
      now(), now(), now()
    );
  END IF;
END $$;
