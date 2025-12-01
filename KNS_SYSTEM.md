# Krump Name System (KNS)

## Overview

The Krump Name System (KNS) is a decentralized identity system built on Story Protocol that allows verified Krump dancers to claim unique `.krump` domain names as their on-chain identity.

## Features

- **Unique Identity**: Each dancer can register one unique KNS name (e.g., "LilBeast.krump")
- **World ID Verified**: Only World ID verified humans can register KNS names
- **Blockchain-Based**: Names are registered on Story Protocol (Testnet: Aeneid)
- **Immutable**: Once registered, names cannot be changed or transferred
- **Verifiable**: KNS badges are displayed throughout the platform to verify identity

## How It Works

### 1. Get Verified
- Connect your Web3 wallet (MetaMask, WalletConnect)
- Complete World ID verification on your profile page
- This ensures only real humans can claim KNS names

### 2. Check Availability
- Choose your desired Krump name
- Click "Check" to see if it's available
- Names must be unique across the entire platform

### 3. Register Your KNS
- Click "Register [YourName].krump"
- Confirm the transaction on Story Testnet
- Your KNS identity is now permanently registered

### 4. Display Your Identity
- Your KNS badge appears next to your name across the platform
- Shows on your profile, in Fam pages, event listings, and more
- Acts as proof of your verified Krump identity

## Technical Details

### Story Protocol Integration
- **Network**: Story Protocol Testnet (Aeneid)
- **Chain ID**: 1315
- **RPC**: https://aeneid.storyrpc.io
- **Explorer**: https://aeneid.explorer.story.foundation

### Smart Contracts
- **SPG Contract**: 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc (Testnet)
- KNS names will be minted as Story Protocol Name Records

### Database Schema
```sql
profiles table:
- krump_name: text (stores the registered KNS name)
- world_id_verified: boolean (required to register)
- wallet_address: text (linked to the KNS registration)
```

## Usage in Code

### Display KNS Badge
```tsx
import { KNSBadge } from "@/components/profile/KNSBadge";

<KNSBadge krumpName="LilBeast" size="sm" />
```

### Register KNS
```tsx
import { KNSRegistration } from "@/components/profile/KNSRegistration";

<KNSRegistration
  profileId={profileId}
  currentKrumpName={krumpName}
  worldIdVerified={worldIdVerified}
  onNameRegistered={(name) => console.log('Registered:', name)}
/>
```

## Future Enhancements

1. **On-Chain Minting**: Full Story Protocol NFT minting for KNS names
2. **Name Marketplace**: Allow trading of rare/premium KNS names
3. **Subdomain System**: Enable Fams to create subdomains (e.g., member.FamName.krump)
4. **Cross-Platform**: Use KNS identity across other Krump platforms
5. **Mainnet Migration**: Deploy to Story Protocol Mainnet

## Security

- **Unique Names**: Database constraints prevent duplicate registrations
- **Human Verification**: World ID ensures one identity per human
- **Wallet-Linked**: Each KNS is permanently linked to a wallet address
- **Immutable**: Names cannot be changed once registered

## Benefits

- **Trust**: Instantly verify real Krump dancers vs fake profiles
- **Reputation**: Build your reputation under a consistent identity
- **Community**: Connect with verified dancers across India
- **Ownership**: True ownership of your digital Krump identity
- **Future-Proof**: Built on decentralized, censorship-resistant infrastructure

## Support

For questions or issues with KNS registration:
- Check your World ID verification status
- Ensure your wallet is connected to Story Testnet
- Contact support via the Discord community
