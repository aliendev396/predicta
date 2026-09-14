-- ============================================================================
-- MAKE 0596842918 THE SOLE ADMIN & SET PASSWORD TO oj11260007
-- Copy and paste this script into your Supabase SQL Editor and click RUN.
-- ============================================================================

-- 1. Reset admin_bootstrap_emails table so ONLY 0596842918 email format is listed
TRUNCATE TABLE public.admin_bootstrap_emails;
INSERT INTO public.admin_bootstrap_emails (email) VALUES
('233596842918@phone.PREDICTA.live'),
('0596842918@phone.PREDICTA.live')
ON CONFLICT DO NOTHING;

-- 2. Update is_default_admin RPC to restrict admin rights SOLELY to 0596842918
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
    )
  );
$$;

-- 3. Update handle_new_user trigger so ONLY 0596842918 gets automatic admin role on signup
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

  IF _phone_clean IN ('0596842918', '233596842918', '596842918') OR NEW.email LIKE '%596842918%' THEN
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

-- 4. Revoke 'admin' role from ALL current users except 0596842918
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT p.id FROM public.profiles p
    WHERE regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') IN ('0596842918', '233596842918', '596842918')
       OR p.email LIKE '%596842918%'
  );

-- 5. Ensure 0596842918 has admin & partner roles, paid status, and set password to 'oj11260007'
DO $$
DECLARE
  _sole_admin_id UUID;
BEGIN
  -- Find user ID for 0596842918
  SELECT p.id INTO _sole_admin_id
  FROM public.profiles p
  WHERE regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') IN ('0596842918', '233596842918', '596842918')
     OR p.email LIKE '%596842918%'
  LIMIT 1;

  IF _sole_admin_id IS NOT NULL THEN
    -- Grant admin & partner roles
    INSERT INTO public.user_roles (user_id, role) VALUES (_sole_admin_id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (_sole_admin_id, 'partner') ON CONFLICT DO NOTHING;

    -- Update profile
    UPDATE public.profiles
       SET registration_paid = true,
           phone = '0596842918',
           updated_at = now()
     WHERE id = _sole_admin_id;

    -- Update auth password to 'oj11260007'
    UPDATE auth.users
       SET encrypted_password = crypt('oj11260007', gen_salt('bf')),
           updated_at = now()
     WHERE id = _sole_admin_id;
  END IF;
END $$;
