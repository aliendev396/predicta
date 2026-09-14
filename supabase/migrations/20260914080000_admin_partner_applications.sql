-- ============================================================================
-- Migration: Rebuild admin_partner_applications RPC
-- Ensures admin query returns all pending partner applications and auto-creates
-- applications for any partner_applicant profiles that were registered via link.
-- ============================================================================

-- Ensure updated_at column exists on partner_applications
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP FUNCTION IF EXISTS public.admin_partner_applications();

CREATE OR REPLACE FUNCTION public.admin_partner_applications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  phone text,
  audience text,
  motivation text,
  payout_method text,
  payout_details text,
  status text,
  admin_note text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin role required';
  END IF;

  -- Auto-populate partner_applications for any user who registered via partner link
  -- but is missing an application row
  INSERT INTO public.partner_applications (user_id, audience, motivation, payout_method, payout_details, status)
  SELECT p.id,
         'Partner link invite',
         'Registered via partner invitation link',
         'MTN MoMo',
         COALESCE(p.phone, 'Pending MoMo number'),
         'pending'
    FROM public.profiles p
   WHERE p.partner_applicant = true
     AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = p.id AND r.role = 'partner')
     AND NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.user_id = p.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN QUERY
  SELECT a.id,
         a.user_id,
         p.full_name,
         p.email,
         p.phone,
         a.audience,
         a.motivation,
         a.payout_method,
         a.payout_details,
         a.status::text,
         a.admin_note,
         a.created_at
    FROM public.partner_applications a
    LEFT JOIN public.profiles p ON p.id = a.user_id
   ORDER BY (a.status = 'pending') DESC, a.created_at DESC
   LIMIT 200;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_partner_applications() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_partner_applications() TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
