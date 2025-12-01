# Battle Challenge System

## Overview

The Battle Challenge System allows Krump dancers with "Ready for Smoke" status to challenge each other, with results tracked on-chain for verifiable competition history.

## Features

- **Call-Out Status**: Only dancers with "Ready for Smoke" status can send/receive challenges
- **Challenge Flow**: Send → Accept/Decline → Battle → Report Results
- **On-Chain Records**: Battle wins, losses, and draws tracked on profiles
- **Real-time Updates**: Live challenge notifications and status updates
- **KNS Integration**: Verified identities displayed throughout battle system

## How It Works

### 1. Set Your Status
- Go to your Profile page
- Toggle "Call-Out Status" to "Ready for Smoke" 🔥
- This makes you visible in the Battle Arena

### 2. Find Opponents
Navigate to the Battles page to see:
- **Incoming**: Challenges sent to you
- **Sent**: Challenges you've sent
- **History**: Past battles and results
- **Ready**: All dancers currently ready for battle

### 3. Send a Challenge
- Click "Send Challenge" button
- Select an opponent from "Ready for Smoke" dancers
- Add an optional message (trash talk encouraged 😤)
- Submit the challenge

### 4. Respond to Challenges
When you receive a challenge:
- **Accept**: Agree to battle
- **Decline**: Turn down the challenge

### 5. Report Results
After the battle:
- Both dancers can report the result
- Choose: Won / Lost / Draw
- Battle records automatically updated
- Results stored on-chain

## Battle Records

Every profile displays their battle record in W-L-D format:
- **W** (Wins): Total victories
- **L** (Losses): Total defeats
- **D** (Draws): Total ties

Example: `12-5-2` = 12 wins, 5 losses, 2 draws

## Database Schema

```sql
battle_challenges table:
- id: uuid (primary key)
- challenger_id: uuid (references profiles)
- challenged_id: uuid (references profiles)
- message: text (optional challenge message)
- status: text (pending, accepted, declined, completed)
- event_id: uuid (optional - link to event)
- created_at: timestamp

profiles table (battle stats):
- battle_wins: integer (default 0)
- battle_losses: integer (default 0)
- battle_draws: integer (default 0)
- call_out_status: enum (labbin, ready_for_smoke)
```

## Row-Level Security (RLS)

### Battle Challenges Policies:
1. **View**: Can view challenges where you're the challenger or challenged
2. **Create**: Can create challenges if you're "ready_for_smoke"
3. **Update**: Challenged user can update status (accept/decline)

### Profiles Policies:
- Battle stats are publicly viewable
- Only owner can update their call-out status

## Technical Implementation

### Components

**Pages:**
- `src/pages/Battles.tsx` - Main battle arena page

**Components:**
- `src/components/battles/CreateChallengeDialog.tsx` - Challenge creation form
- `src/components/battles/ChallengeCard.tsx` - Individual challenge display

### Challenge Flow Logic

```typescript
// Create Challenge
const createChallenge = async () => {
  // 1. Verify user is verified and "ready_for_smoke"
  // 2. Insert challenge with status="pending"
  // 3. Notify opponent
};

// Accept Challenge
const acceptChallenge = async () => {
  // 1. Update status to "accepted"
  // 2. Notify challenger
};

// Report Result
const reportResult = async (result: 'won' | 'lost' | 'draw') => {
  // 1. Update challenge status to "completed"
  // 2. Fetch current battle stats for both dancers
  // 3. Increment appropriate stat (wins/losses/draws)
  // 4. Update both profiles
};
```

## Future Enhancements

1. **Video Evidence**: Upload battle videos to IPFS
2. **NFT Certificates**: Mint battle results as NFTs on Story Protocol
3. **Judge System**: Community voting on disputed results
4. **Leaderboards**: Rankings by win rate, total battles, etc.
5. **Fam Battles**: Team vs team crew battles
6. **Battle Events**: Link challenges to specific events
7. **Reputation System**: Trust scores based on result reporting
8. **Wagering**: Optional token/NFT stakes for battles

## On-Chain Integration

### Current (Database)
- Battle records stored in Supabase profiles table
- Verifiable through public_profiles view
- Timestamped and immutable once recorded

### Planned (Story Protocol)
- Mint battle results as Story Protocol Name Records
- Create verifiable on-chain battle history
- Enable cross-platform battle record verification
- NFT certificates for significant battles

## Usage Examples

### Check Battle Stats
```typescript
const { data } = await supabase
  .from("profiles")
  .select("battle_wins, battle_losses, battle_draws, call_out_status")
  .eq("id", profileId)
  .single();

const record = `${data.battle_wins}-${data.battle_losses}-${data.battle_draws}`;
```

### Find Ready Dancers
```typescript
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("call_out_status", "ready_for_smoke")
  .order("battle_wins", { ascending: false });
```

### Load User's Challenges
```typescript
const { data: incoming } = await supabase
  .from("battle_challenges")
  .select("*, challenger:profiles(*), challenged:profiles(*)")
  .eq("challenged_id", myProfileId)
  .eq("status", "pending");
```

## Battle Etiquette

- **Respect**: Keep messages competitive but respectful
- **Honesty**: Report results accurately
- **Availability**: Only set "Ready for Smoke" when actually available
- **Response**: Respond to challenges within reasonable time
- **Follow-Through**: Complete accepted battles

## Security Considerations

- ✅ World ID verification required to send challenges
- ✅ RLS policies prevent unauthorized updates
- ✅ Input validation on all challenge forms
- ✅ Rate limiting on challenge creation (database triggers)
- ✅ Battle stats only updatable through proper flow

## Support

For questions or issues:
- Check your World ID verification status
- Ensure call-out status is set correctly
- Report bugs via Discord community
- Request features through GitHub issues

---

**Remember**: The battle system is about building community, pushing skills, and having verifiable competition history. Battle with honor! 🔥
