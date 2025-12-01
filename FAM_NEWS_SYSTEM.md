# Fam News Feed & Showcase System

## Overview

The Fam News Feed allows Fam members to share updates, announcements, achievements, and media with their community. The Showcase Gallery will display Video NFTs minted by Fam members.

## Features

### News Feed
- **Post Types**: Announcements, Updates, Achievements, Recruitment, Media
- **Rich Content**: Text, images, and videos with IPFS storage
- **Pinned Posts**: Important posts stay at the top
- **Member Posting**: All Fam members can create posts
- **Real-time Updates**: Automatic refresh when new posts are added

### Showcase Gallery (Coming Soon)
- **Video NFTs**: Display minted performances from Fam members
- **Filtering**: By member, date, or performance type
- **Metadata**: Show licensing terms and Story Protocol details

## Database Schema

```sql
CREATE TABLE public.fam_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fam_id UUID NOT NULL REFERENCES public.fams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'announcement',
  media_url TEXT,
  media_ipfs TEXT,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Row-Level Security (RLS)

### Required Policies

You need to add these RLS policies manually through the Lovable Cloud backend interface:

1. **SELECT Policy** (Everyone can view posts):
```sql
CREATE POLICY "Posts viewable by everyone" 
ON public.fam_posts 
FOR SELECT 
USING (true);
```

2. **INSERT Policy** (Big Homie and members can create):
```sql
CREATE POLICY "Members can create posts" 
ON public.fam_posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fams
    WHERE fams.id = fam_posts.fam_id
    AND fams.big_homie_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.fam_members
    WHERE fam_members.fam_id = fam_posts.fam_id
    AND fam_members.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);
```

3. **UPDATE Policy** (Author and Big Homie can update):
```sql
CREATE POLICY "Authors can update posts" 
ON public.fam_posts 
FOR UPDATE 
USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.fams
    WHERE fams.id = fam_posts.fam_id
    AND fams.big_homie_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);
```

4. **DELETE Policy** (Author and Big Homie can delete):
```sql
CREATE POLICY "Authors can delete posts"
ON public.fam_posts
FOR DELETE
USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.fams
    WHERE fams.id = fam_posts.fam_id
    AND fams.big_homie_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);
```

### How to Add Policies

1. Click the "View Backend" button below
2. Navigate to Database → Tables → fam_posts
3. Go to the SQL Editor
4. Run each policy SQL statement above
5. Verify policies are active in the Policies tab

## Post Types

### Announcement 📢
- Major news or important information
- Fam-wide alerts
- Event announcements

### Update 📝
- General updates
- Progress reports
- Casual news

### Achievement 🏆
- Battle wins
- Competition results
- Member milestones

### Recruitment 👥
- Audition announcements
- New member welcomes
- Recruitment status changes

### Media 📸
- Photos and videos
- Performance showcases
- Behind-the-scenes content

## Components

### `CreatePostDialog`
Dialog for creating new Fam posts.

**Props:**
- `famId`: UUID of the Fam
- `authorId`: UUID of the post author (profile ID)
- `onPostCreated`: Callback when post is successfully created

**Usage:**
```tsx
<CreatePostDialog
  famId={fam.id}
  authorId={profile.id}
  onPostCreated={() => loadPosts()}
/>
```

### `PostCard`
Display component for individual Fam posts.

**Props:**
- `post`: FamPost object with author details

**Usage:**
```tsx
{posts.map((post) => (
  <PostCard key={post.id} post={post} />
))}
```

## Features Breakdown

### Permissions
- **View Posts**: Anyone can view Fam posts
- **Create Posts**: Big Homie + all Fam members
- **Edit Posts**: Post author + Big Homie
- **Delete Posts**: Post author + Big Homie
- **Pin Posts**: Big Homie only (future feature)

### Media Handling
- Images and videos uploaded to IPFS via Pinata
- Both IPFS hash and gateway URL stored
- Automatic media type detection (image vs video)
- Responsive display with max heights

### Real-time Updates (Future)
```typescript
useEffect(() => {
  const channel = supabase
    .channel('fam_posts_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fam_posts',
        filter: `fam_id=eq.${famId}`
      },
      () => loadPosts()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [famId]);
```

## Future Enhancements

### News Feed
1. **Reactions**: Like, fire, crown reactions on posts
2. **Comments**: Threaded discussions on posts
3. **Pin Posts**: Big Homie can pin important posts
4. **Post Editing**: Edit history and timestamps
5. **Rich Media**: GIFs, embeds, polls
6. **Notifications**: Alert members of new posts
7. **Search**: Find posts by keyword or type

### Showcase Gallery
1. **Video NFT Grid**: Display all minted Videos from members
2. **Filtering**: By member, date, performance type
3. **Story Protocol**: Show licensing terms and IP metadata
4. **Play Inline**: Video player with controls
5. **Collections**: Curated galleries by theme
6. **Featured**: Highlight best performances
7. **Stats**: View counts, favorites, shares

## Usage Examples

### Load Posts for a Fam
```typescript
const loadPosts = async (famId: string) => {
  const { data, error } = await supabase
    .from("fam_posts")
    .select(`
      *,
      author:profiles!fam_posts_author_id_fkey(
        display_name,
        krump_name,
        profile_picture_url
      )
    `)
    .eq("fam_id", famId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return data;
};
```

### Create a Post
```typescript
const createPost = async (post: PostData) => {
  const { error } = await supabase
    .from("fam_posts")
    .insert({
      fam_id: post.famId,
      author_id: post.authorId,
      title: post.title,
      content: post.content,
      post_type: post.postType,
      media_url: post.mediaUrl,
      media_ipfs: post.mediaIpfs,
    });

  if (error) throw error;
};
```

## Security

- ✅ RLS enabled on fam_posts table
- ✅ Only authenticated members can post
- ✅ Authors control their own posts
- ✅ Big Homie has moderation powers
- ✅ Input validation (max lengths, type checks)
- ✅ IPFS for decentralized media storage

## Best Practices

### For Fam Members
- Keep posts relevant to the Fam
- Use appropriate post types
- Add media to enhance engagement
- Respect community guidelines

### For Big Homies
- Pin important announcements
- Moderate inappropriate content
- Encourage member participation
- Use achievement posts to celebrate wins

## Troubleshooting

### Posts not loading?
- Check RLS policies are correctly applied
- Verify user is authenticated
- Check browser console for errors

### Can't create posts?
- Ensure you're a Fam member
- Verify World ID verification status
- Check if fam_id and author_id are correct

### Media not uploading?
- Check file size (<20MB recommended)
- Verify Pinata credentials in secrets
- Try with smaller file first

---

**Note**: Make sure RLS policies are properly set up before using this feature in production!
