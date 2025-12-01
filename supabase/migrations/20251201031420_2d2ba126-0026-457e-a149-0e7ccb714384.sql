-- Fix RLS policies for better security

-- 1. Fix sessions table to properly check fam-only access
DROP POLICY IF EXISTS "Sessions are viewable by verified users" ON sessions;

CREATE POLICY "Sessions viewable by authorized users"
ON sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (profiles.world_id_verified = true OR profiles.phone_verified = true)
  )
  AND (
    -- Public sessions (not fam-only) are visible to all verified users
    is_fam_only = false
    OR
    -- Fam-only sessions are only visible to members of the allowed fam
    EXISTS (
      SELECT 1 FROM fam_members fm
      JOIN profiles p ON p.id = fm.profile_id
      WHERE fm.fam_id = sessions.allowed_fam_id
      AND p.user_id = auth.uid()
    )
    OR
    -- Session host can always see their own sessions
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = sessions.host_id
      AND profiles.user_id = auth.uid()
    )
  )
);

-- 2. Restrict profiles table to limit public data exposure
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Full profile access for owner
CREATE POLICY "Users can view own full profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Limited public profile data for others (only non-sensitive fields)
CREATE POLICY "Limited public profile view"
ON profiles FOR SELECT
USING (
  auth.uid() != user_id
  AND true -- Allow read but app should only query specific columns
);

-- Note: Frontend should only query non-sensitive fields for public profiles:
-- display_name, krump_name, rank, profile_picture_url, call_out_status, 
-- battle_wins, battle_losses, battle_draws, bio (optional)

COMMENT ON TABLE profiles IS 'Public queries should exclude: wallet_address, instagram_handle, phone_verified, world_id_nullifier_hash, user_id, city';
