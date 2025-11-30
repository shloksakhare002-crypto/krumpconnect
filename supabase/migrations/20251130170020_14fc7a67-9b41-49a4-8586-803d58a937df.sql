-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.krump_rank AS ENUM ('new_boot', 'young', 'jr', 'sr', 'og');
CREATE TYPE public.call_out_status AS ENUM ('ready_for_smoke', 'labbin');
CREATE TYPE public.session_type AS ENUM ('casual_practice', 'heavy_lab', 'workshop');
CREATE TYPE public.fam_recruitment_status AS ENUM ('closed_circle', 'scouting', 'auditions_open');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  krump_name TEXT UNIQUE,
  display_name TEXT NOT NULL,
  rank krump_rank DEFAULT 'new_boot',
  bio TEXT,
  city TEXT,
  profile_picture_ipfs TEXT,
  profile_picture_url TEXT,
  banner_ipfs TEXT,
  banner_url TEXT,
  world_id_verified BOOLEAN DEFAULT false,
  world_id_nullifier_hash TEXT UNIQUE,
  call_out_status call_out_status DEFAULT 'labbin',
  battle_wins INTEGER DEFAULT 0,
  battle_losses INTEGER DEFAULT 0,
  battle_draws INTEGER DEFAULT 0,
  instagram_handle TEXT,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Style tags table
CREATE TABLE public.style_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Insert default style tags
INSERT INTO public.style_tags (name, description) VALUES
  ('Technical', 'Precise, controlled movements'),
  ('Grime', 'Raw, aggressive energy'),
  ('Bull', 'Powerful, charging style'),
  ('Goofy', 'Playful, expressive'),
  ('Rugged', 'Rough, street-focused');

-- Profile style tags junction table
CREATE TABLE public.profile_style_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  style_tag_id UUID REFERENCES public.style_tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(profile_id, style_tag_id)
);

-- Fams table
CREATE TABLE public.fams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  city TEXT,
  logo_ipfs TEXT,
  logo_url TEXT,
  big_homie_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recruitment_status fam_recruitment_status DEFAULT 'closed_circle',
  audition_details TEXT,
  audition_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fam members table (for lineage tracking)
CREATE TABLE public.fam_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fam_id UUID REFERENCES public.fams(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  generation INTEGER DEFAULT 1,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(fam_id, profile_id)
);

-- Update profiles with fam relationship
ALTER TABLE public.profiles ADD COLUMN current_fam_id UUID REFERENCES public.fams(id) ON DELETE SET NULL;

-- Fam challenges (Hit List)
CREATE TABLE public.fam_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_fam_id UUID REFERENCES public.fams(id) ON DELETE CASCADE NOT NULL,
  challenged_fam_id UUID REFERENCES public.fams(id) ON DELETE CASCADE NOT NULL,
  challenge_text TEXT NOT NULL,
  format TEXT, -- e.g., "5v5", "3v3"
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  session_type session_type NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  max_participants INTEGER,
  is_fam_only BOOLEAN DEFAULT false,
  allowed_fam_id UUID REFERENCES public.fams(id) ON DELETE SET NULL,
  rules TEXT,
  kns_minted BOOLEAN DEFAULT false,
  kns_token_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Session join requests
CREATE TABLE public.session_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, requester_id)
);

-- Session ratings
CREATE TABLE public.session_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  floor_quality INTEGER CHECK (floor_quality >= 1 AND floor_quality <= 5),
  safety INTEGER CHECK (safety >= 1 AND safety <= 5),
  equipment INTEGER CHECK (equipment >= 1 AND equipment <= 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, rater_id)
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- battle, workshop, jam, showcase
  location_name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  flyer_ipfs TEXT,
  flyer_url TEXT,
  registration_link TEXT,
  max_participants INTEGER,
  is_ikf_qualifier BOOLEAN DEFAULT false,
  kns_minted BOOLEAN DEFAULT false,
  kns_token_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT,
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, profile_id)
);

-- Battle challenges
CREATE TABLE public.battle_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenged_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_style_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fam_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fam_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for style_tags
CREATE POLICY "Style tags are viewable by everyone"
  ON public.style_tags FOR SELECT
  USING (true);

-- RLS Policies for profile_style_tags
CREATE POLICY "Profile style tags are viewable by everyone"
  ON public.profile_style_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own style tags"
  ON public.profile_style_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_style_tags.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for fams
CREATE POLICY "Fams are viewable by everyone"
  ON public.fams FOR SELECT
  USING (true);

CREATE POLICY "Big Homie can update fam"
  ON public.fams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = fams.big_homie_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Verified users can create fams"
  ON public.fams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.world_id_verified = true
    )
  );

-- RLS Policies for fam_members
CREATE POLICY "Fam members are viewable by everyone"
  ON public.fam_members FOR SELECT
  USING (true);

CREATE POLICY "Big Homie can manage fam members"
  ON public.fam_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.fams
      JOIN public.profiles ON profiles.id = fams.big_homie_id
      WHERE fams.id = fam_members.fam_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for fam_challenges
CREATE POLICY "Fam challenges are viewable by everyone"
  ON public.fam_challenges FOR SELECT
  USING (true);

CREATE POLICY "Fam members can create challenges"
  ON public.fam_challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fam_members
      JOIN public.profiles ON profiles.id = fam_members.profile_id
      WHERE fam_members.fam_id = challenger_fam_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for sessions
CREATE POLICY "Sessions are viewable by verified users"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (profiles.world_id_verified = true OR profiles.phone_verified = true)
    )
  );

CREATE POLICY "Verified users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = host_id
      AND profiles.user_id = auth.uid()
      AND profiles.world_id_verified = true
    )
  );

CREATE POLICY "Host can update their sessions"
  ON public.sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = sessions.host_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for session_requests
CREATE POLICY "Users can view requests for their sessions"
  ON public.session_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      JOIN public.profiles ON profiles.id = sessions.host_id
      WHERE sessions.id = session_requests.session_id
      AND profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = session_requests.requester_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create session requests"
  ON public.session_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = requester_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Host can update session requests"
  ON public.session_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      JOIN public.profiles ON profiles.id = sessions.host_id
      WHERE sessions.id = session_requests.session_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for session_ratings
CREATE POLICY "Session ratings are viewable by everyone"
  ON public.session_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON public.session_ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = rater_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for events
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Verified users can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = organizer_id
      AND profiles.user_id = auth.uid()
      AND profiles.world_id_verified = true
    )
  );

CREATE POLICY "Organizers can update their events"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = events.organizer_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for event_registrations
CREATE POLICY "Event registrations are viewable by organizers and registrants"
  ON public.event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      JOIN public.profiles ON profiles.id = events.organizer_id
      WHERE events.id = event_registrations.event_id
      AND profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = event_registrations.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for battle_challenges
CREATE POLICY "Battle challenges are viewable by participants"
  ON public.battle_challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE (profiles.id = battle_challenges.challenger_id OR profiles.id = battle_challenges.challenged_id)
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Ready users can create battle challenges"
  ON public.battle_challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = challenger_id
      AND profiles.user_id = auth.uid()
      AND profiles.call_out_status = 'ready_for_smoke'
    )
  );

CREATE POLICY "Challenged users can update battle challenges"
  ON public.battle_challenges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = battle_challenges.challenged_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fams_updated_at
  BEFORE UPDATE ON public.fams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();