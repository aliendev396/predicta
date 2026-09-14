-- ============================================================================
-- HOTFIX: Restore correct handle_new_user trigger
-- The previous migration (20260914010000) broke signup by replacing the
-- working trigger with a broken version. This restores it.
-- Admin 0552231466 is already in admin_bootstrap_emails from the previous
-- migration, so it will automatically get admin role on signup.
-- ============================================================================

-- Restore the correct handle_new_user trigger (same as bulletproof version
-- in 20260827210000, which uses admin_bootstrap_emails for admin detection)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _code TEXT;
  _ref UUID;
  _is_applicant BOOLEAN;
BEGIN
  LOOP
    _code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = _code);
  END LOOP;

  SELECT p.id INTO _ref FROM public.profiles p
   WHERE p.referral_code = upper(NULLIF(NEW.raw_user_meta_data->>'referral_code',''))
     AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = p.id AND r.role = 'partner');

  _is_applicant := COALESCE(NEW.raw_user_meta_data->>'partner_applicant','') IN ('true','1');

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    referral_code,
    referred_by,
    partner_applicant,
    registration_paid,
    credits
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'full_name',''),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    _code,
    _ref,
    _is_applicant,
    CASE WHEN _is_applicant THEN true ELSE false END,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    partner_applicant = CASE WHEN _is_applicant THEN true ELSE profiles.partner_applicant END,
    registration_paid = CASE WHEN _is_applicant THEN true ELSE profiles.registration_paid END;

  -- Default member role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  -- Auto-create pending partner application for admin review
  IF _is_applicant THEN
    INSERT INTO public.partner_applications (
      user_id,
      audience,
      motivation,
      payout_method,
      payout_details,
      status
    )
    VALUES (
      NEW.id,
      'Partner link invite',
      'Registered via partner invitation link',
      'MTN MoMo',
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone',''), 'Pending'),
      'pending'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Bootstrap admin: any email in admin_bootstrap_emails gets admin role automatically
  IF EXISTS (
    SELECT 1 FROM public.admin_bootstrap_emails WHERE lower(email) = lower(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'partner')
    ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET registration_paid = true WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Also restore is_default_admin to use bootstrap emails table properly
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
      -- Check admin_bootstrap_emails table (covers 0552231466 and 0596842918)
      EXISTS (
        SELECT 1 FROM public.admin_bootstrap_emails b
        WHERE lower(b.email) = lower(u.email)
      )
      -- Also check by phone for backward compatibility
      OR p.phone IN ('0596842918', '233596842918', '+233596842918')
      OR regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') IN ('0596842918', '233596842918', '596842918')
      OR u.email LIKE '%596842918%'
      OR p.phone IN ('0552231466', '233552231466', '+233552231466')
      OR regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') IN ('0552231466', '233552231466', '552231466')
      OR u.email LIKE '%552231466%'
    )
  );
$$;

NOTIFY pgrst, 'reload schema';
