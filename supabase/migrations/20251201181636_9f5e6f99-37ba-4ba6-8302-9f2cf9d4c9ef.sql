-- Create fam_posts table for news feed
CREATE TABLE public.fam_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fam_id UUID NOT NULL REFERENCES public.fams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  media_url TEXT,
  media_ipfs TEXT,
  post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('announcement', 'achievement', 'media', 'event', 'general')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fam_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view fam posts
CREATE POLICY "Fam posts are viewable by everyone"
ON public.fam_posts
FOR SELECT
USING (true);

-- Policy: Fam members can create posts
CREATE POLICY "Fam members can create posts"
ON public.fam_posts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM fam_members fm
    JOIN profiles p ON p.id = fm.profile_id
    WHERE fm.fam_id = fam_posts.fam_id
    AND p.id = fam_posts.author_id
    AND p.user_id = auth.uid()
  )
);

-- Policy: Big Homie or post author can update posts
CREATE POLICY "Fam members can update their own posts"
ON public.fam_posts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = fam_posts.author_id
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM fams f
    JOIN profiles p ON p.id = f.big_homie_id
    WHERE f.id = fam_posts.fam_id
    AND p.user_id = auth.uid()
  )
);

-- Policy: Big Homie or post author can delete posts
CREATE POLICY "Fam members can delete their own posts"
ON public.fam_posts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = fam_posts.author_id
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM fams f
    JOIN profiles p ON p.id = f.big_homie_id
    WHERE f.id = fam_posts.fam_id
    AND p.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_fam_posts_updated_at
BEFORE UPDATE ON public.fam_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_fam_posts_fam_id ON public.fam_posts(fam_id);
CREATE INDEX idx_fam_posts_created_at ON public.fam_posts(created_at DESC);