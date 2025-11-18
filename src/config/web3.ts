import { http, createConfig } from 'wagmi';
import { Chain } from 'viem';

// Story Protocol Mainnet Chain
export const storyMainnet = {
  id: 1514,
  name: 'Story Network',
  nativeCurrency: { name: 'IP Token', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
    public: { http: ['https://mainnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://explorer.story.foundation',
    },
  },
  testnet: false,
} as const satisfies Chain;

// Story Protocol Testnet Chain (Aeneid)
export const storyTestnet = {
  id: 1315,
  name: 'Story Testnet (Aeneid)',
  nativeCurrency: { name: 'Test IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
    public: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Testnet Explorer',
      url: 'https://aeneid.explorer.story.foundation',
    },
  },
  testnet: true,
} as const satisfies Chain;

// Story Protocol Contract Addresses
export const STORY_CONTRACTS = {
  mainnet: {
    spg: '', // User must deploy their own on mainnet
  },
  testnet: {
    spg: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
  },
};

export const config = createConfig({
  chains: [storyTestnet, storyMainnet],
  transports: {
    [storyTestnet.id]: http(),
    [storyMainnet.id]: http(),
  },
});
