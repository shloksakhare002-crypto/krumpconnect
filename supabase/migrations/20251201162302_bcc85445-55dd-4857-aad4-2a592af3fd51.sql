CREATE TABLE public.fam_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fam_id UUID NOT NULL REFERENCES public.fams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'announcement' CHECK (post_type IN ('announcement', 'update', 'achievement', 'recruitment', 'media')),
  media_url TEXT,
  media_ipfs TEXT,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fam_posts ENABLE ROW LEVEL SECURITY;