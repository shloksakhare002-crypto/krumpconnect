CREATE TABLE IF NOT EXISTS public.video_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fam_id UUID REFERENCES public.fams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_ipfs TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_ipfs TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  ip_asset_id TEXT,
  nft_token_id TEXT,
  nft_contract_address TEXT,
  chain_id INTEGER NOT NULL,
  license_terms TEXT,
  transaction_hash TEXT,
  metadata_json JSONB,
  attributes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  minted_at TIMESTAMPTZ,
  CONSTRAINT valid_chain_id CHECK (chain_id IN (1514, 1315))
);

CREATE INDEX idx_video_nfts_creator ON public.video_nfts(creator_id);
CREATE INDEX idx_video_nfts_fam ON public.video_nfts(fam_id);
CREATE INDEX idx_video_nfts_chain ON public.video_nfts(chain_id);
CREATE INDEX idx_video_nfts_created ON public.video_nfts(created_at DESC);