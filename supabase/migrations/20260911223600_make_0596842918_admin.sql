-- Grant admin and partner status to phone 0596842918

-- 1. Update is_default_admin RPC to recognize 0596842918
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
    LEFT JOIN public.admin_bootstrap_emails b ON lower(b.email) = lower(p.email) OR lower(b.email) = lower(u.email)
    WHERE u.id = _user_id AND (
      b.email IS NOT NULL
      OR LOWER(u.email) IN ('yeboahalbert396@gmail.com', 'admin@predicta.live', 'predicta@gmail.com')
      OR p.phone IN ('0596842918', '233596842918', '0241234567', '233241234567')
      OR regexp_replace(p.phone, '\D', '', 'g') IN ('0596842918', '233596842918', '596842918')
    )
  );
$$;

-- 2. Update handle_new_user trigger so signups with 0596842918 get auto admin & partner roles
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

  IF EXISTS (SELECT 1 FROM public.admin_bootstrap_emails WHERE LOWER(email) = LOWER(NEW.email))
     OR LOWER(NEW.email) IN ('yeboahalbert396@gmail.com', 'admin@predicta.live')
     OR _phone_clean IN ('0596842918', '233596842918', '596842918') THEN
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

-- 3. Grant admin & partner roles to any existing user with phone 0596842918
DO $$
DECLARE
  _target_user_id UUID;
BEGIN
  FOR _target_user_id IN
    SELECT p.id FROM public.profiles p
    WHERE regexp_replace(p.phone, '\D', '', 'g') IN ('0596842918', '233596842918', '596842918')
       OR p.email LIKE '%233596842918%'
       OR p.email LIKE '%0596842918%'
  LOOP
    INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, 'partner') ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET registration_paid = true WHERE id = _target_user_id;
  END LOOP;
END $$;
