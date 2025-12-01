// Story Protocol SPG (Simple NFT Creator) Contract ABI
// This is a minimal ABI with only the functions we need for minting

export const SPG_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "ipMetadata", type: "tuple", components: [
            { name: "ipMetadataURI", type: "string" },
            { name: "ipMetadataHash", type: "bytes32" },
            { name: "nftMetadataURI", type: "string" },
            { name: "nftMetadataHash", type: "bytes32" }
          ]},
          { name: "recipient", type: "address" }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "mintAndRegisterIp",
    outputs: [
      { name: "ipId", type: "address" },
      { name: "tokenId", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// License Terms
export const LICENSE_TERMS = {
  COMMERCIAL_USE: "commercial_use",
  NON_COMMERCIAL: "non_commercial",
  COMMERCIAL_REMIX: "commercial_remix",
  CC_BY: "cc_by",
  CC_BY_NC: "cc_by_nc",
  CC_BY_SA: "cc_by_sa",
} as const;

export const LICENSE_DESCRIPTIONS = {
  [LICENSE_TERMS.COMMERCIAL_USE]: "Commercial Use - Others can use for profit",
  [LICENSE_TERMS.NON_COMMERCIAL]: "Non-Commercial - Personal use only",
  [LICENSE_TERMS.COMMERCIAL_REMIX]: "Commercial Remix - Can remix and monetize",
  [LICENSE_TERMS.CC_BY]: "CC BY - Free use with attribution",
  [LICENSE_TERMS.CC_BY_NC]: "CC BY-NC - Non-commercial with attribution",
  [LICENSE_TERMS.CC_BY_SA]: "CC BY-SA - Share-alike with attribution",
} as const;

// Helper to get SPG contract address based on chain
export const getSPGAddress = (chainId: number): string | undefined => {
  if (chainId === 1315) return "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc"; // Testnet
  if (chainId === 1514) return undefined; // Mainnet - user must deploy
  return undefined;
};

// Helper to generate IP metadata for Story Protocol
export interface VideoMetadata {
  title: string;
  description: string;
  videoIpfs: string;
  thumbnailIpfs?: string;
  creator: string;
  famName?: string;
  durationSeconds?: number;
  attributes: {
    style?: string;
    city?: string;
    date?: string;
    [key: string]: string | undefined;
  };
}

export const generateIPMetadata = (metadata: VideoMetadata) => {
  return {
    name: metadata.title,
    description: metadata.description,
    image: metadata.thumbnailIpfs || metadata.videoIpfs,
    animation_url: metadata.videoIpfs,
    attributes: [
      { trait_type: "Creator", value: metadata.creator },
      { trait_type: "Type", value: "Krump Performance Video" },
      ...(metadata.famName ? [{ trait_type: "Fam", value: metadata.famName }] : []),
      ...(metadata.attributes.style ? [{ trait_type: "Style", value: metadata.attributes.style }] : []),
      ...(metadata.attributes.city ? [{ trait_type: "City", value: metadata.attributes.city }] : []),
      ...(metadata.durationSeconds ? [{ trait_type: "Duration", value: `${metadata.durationSeconds}s` }] : []),
    ],
    external_url: "https://krumpindia.com",
  };
};
