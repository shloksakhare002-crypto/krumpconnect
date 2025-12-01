# Video NFT Minting System - Story Protocol Integration

This document describes the Video NFT minting system integrated with Story Protocol for the Krump India Connect app.

## Overview

Dancers can mint their Krump performance videos as NFTs on Story Protocol, creating verifiable on-chain records with IPFS storage, licensing terms, and IP asset registration.

## Database Schema

### Table: `video_nfts`

```sql
CREATE TABLE public.video_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fam_id UUID REFERENCES public.fams(id) ON DELETE SET NULL,
  
  -- Video metadata
  title TEXT NOT NULL,
  description TEXT,
  video_ipfs TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_ipfs TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  
  -- Story Protocol data
  ip_asset_id TEXT,
  nft_token_id TEXT,
  nft_contract_address TEXT,
  chain_id INTEGER NOT NULL,
  license_terms TEXT,
  transaction_hash TEXT,
  
  -- Metadata
  metadata_json JSONB,
  attributes JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  minted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_chain_id CHECK (chain_id IN (1514, 1315))
);
```

### Required RLS Policies

**IMPORTANT**: The following RLS policies need to be added manually via the Lovable Cloud backend interface:

1. **SELECT Policy** - Allow everyone to view video NFTs:
```sql
ALTER TABLE public.video_nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_nfts_select_all" 
ON public.video_nfts 
FOR SELECT 
USING (true);
```

2. **INSERT Policy** - Allow users to create their own video NFTs:
```sql
CREATE POLICY "video_nfts_insert_own" 
ON public.video_nfts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = video_nfts.creator_id
    AND profiles.user_id = auth.uid()
  )
);
```

3. **UPDATE Policy** - Allow creators to update their own video NFTs:
```sql
CREATE POLICY "video_nfts_update_own" 
ON public.video_nfts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = video_nfts.creator_id
    AND profiles.user_id = auth.uid()
  )
);
```

## Story Protocol Integration

### Networks Supported

- **Testnet (Aeneid)**: Chain ID 1315
  - RPC: https://aeneid.storyrpc.io
  - SPG Contract: `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc`
  - Explorer: https://aeneid.explorer.story.foundation

- **Mainnet**: Chain ID 1514
  - RPC: https://mainnet.storyrpc.io
  - SPG Contract: User must deploy their own
  - Explorer: https://explorer.story.foundation

### SPG Contract

The Simple NFT Creator (SPG) contract is used for minting. It provides a simplified interface for:
- Minting NFTs
- Registering IP assets
- Setting metadata URIs
- Associating licenses

### Minting Flow

1. **Upload Video to IPFS** via Pinata
2. **Upload Thumbnail** (optional) to IPFS
3. **Generate Metadata** with all video details
4. **Upload Metadata** to IPFS
5. **Mint NFT** via SPG contract on Story Protocol
6. **Save Record** to Lovable Cloud database
7. **Display** in Fam Showcase Gallery

### Metadata Structure

```json
{
  "name": "Video Title",
  "description": "Video description",
  "image": "ipfs://thumbnail_hash",
  "animation_url": "ipfs://video_hash",
  "attributes": [
    { "trait_type": "Creator", "value": "Krump Name" },
    { "trait_type": "Type", "value": "Krump Performance Video" },
    { "trait_type": "Fam", "value": "Fam Name" },
    { "trait_type": "Style", "value": "Buck, Arm Swings" },
    { "trait_type": "City", "value": "Mumbai" },
    { "trait_type": "Duration", "value": "120s" }
  ],
  "external_url": "https://krumpindia.com"
}
```

## License Terms

Available licensing options:
- `commercial_use` - Others can use for profit
- `non_commercial` - Personal use only
- `commercial_remix` - Can remix and monetize
- `cc_by` - Free use with attribution
- `cc_by_nc` - Non-commercial with attribution
- `cc_by_sa` - Share-alike with attribution

## Components

### MintVideoNFTDialog

Main minting interface component:
- File upload (video + optional thumbnail)
- Form for title, description, metadata
- License term selection
- Network switching (Testnet/Mainnet)
- IPFS upload progress
- Blockchain transaction handling

Location: `src/components/story/MintVideoNFTDialog.tsx`

### VideoNFTCard

Display component for minted videos:
- Video player with controls
- Metadata display
- Network badge
- License information
- Link to Story Protocol explorer

Location: `src/components/story/VideoNFTCard.tsx`

## Usage in Fam Pages

The minting dialog is available in the Fam Detail Showcase tab. Fam members can:
1. Click "Mint Video NFT"
2. Fill in video details
3. Upload video file
4. Select licensing terms
5. Mint on Story Protocol
6. Video appears in Fam gallery

## Security Considerations

- All video uploads require authentication
- Only Fam members can mint for their Fam
- IPFS ensures content permanence
- RLS policies enforce data access control
- Wallet signatures required for minting
- Transaction hashes stored for verification

## Future Enhancements

- Video NFT trading/marketplace
- Derivative works tracking
- Revenue sharing from licensing
- Battle video minting workflow
- Session recording minting
- Event highlight minting
- Collaborative video NFTs (crew battles)
- NFT-gated content access
