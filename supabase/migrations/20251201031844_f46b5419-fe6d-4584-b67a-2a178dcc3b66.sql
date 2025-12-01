-- Fix profile data exposure by creating a secure public view
-- This view only exposes non-sensitive profile information

-- Create a view for public profile access with limited columns
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  krump_name,
  rank,
  profile_picture_url,
  profile_picture_ipfs,
  banner_url,
  banner_ipfs,
  call_out_status,
  battle_wins,
  battle_losses,
  battle_draws,
  bio,
  current_fam_id,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Drop the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "Limited public profile view" ON public.profiles;

-- Create new restrictive policy: users can only see their own full profile
-- Other users must use the public_profiles view for limited data
CREATE POLICY "Users can only view their own full profile data"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Grant SELECT on the public view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;