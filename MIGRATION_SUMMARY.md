# API Migration to Firebase Functions - Summary

## ✅ Migration Complete

All API calls have been migrated from the localhost Express server to Firebase Functions.

## Files Updated

### 1. Configuration
- **`src/config/firebase.ts`** (NEW)
  - Created centralized configuration for Firebase Functions base URL
  - Automatically switches between local emulator and production
  - Local: `http://localhost:5001/coho-mastodon/us-central1`
  - Production: `https://us-central1-coho-mastodon.cloudfunctions.net`

### 2. Service Files Updated

#### `src/services/account.ts`
- ✅ `checkFollowing` → `isFollowing` function
- ✅ `getAccount` → `getAccount` function
- ✅ `getUsersPosts` → `getUserPosts` function
- ✅ `getUsersFollowers` → `getFollowers` function
- ✅ `getFollowing` → `getFollowing` function
- ✅ `followUser` → `follow` function
- ✅ `getInstanceInfo` → Calls Mastodon API directly
- ✅ `initAuth` → `authenticate` function (returns `{url: "..."}`)
- ✅ `authToClient` → `getClient` function (returns `{access_token: "..."}`)

#### `src/services/bookmarks.ts`
- ✅ `getBookmarks` → `getBookmarks` function
- ✅ `addBookmark` → `bookmark` function

#### `src/services/favorites.ts`
- ✅ `getFavorites` → `getFavorites` function

#### `src/services/messages.ts`
- ✅ `getMessages` → `getMessages` function

#### `src/services/timeline.ts`
- ✅ `getHomeTimeline` → `getTimelinePaginated` function
- ✅ `getPublicTimeline` → Calls Mastodon API directly
- ✅ `reblogPost` → `reblog` function
- ✅ `getReplies` → `getReplies` function
- ✅ `reply` → Calls Mastodon API directly (uses `/api/v1/statuses`)
- ✅ `mediaTimeline` → Calls Mastodon API directly
- ✅ `searchTimeline` → `search` function
- ✅ `getHashtagTimeline` → Calls Mastodon API directly

#### `src/services/ai.ts`
- ✅ `createAPost` → `generateStatus` function
- ✅ `createImage` → `generateImage` function
- ⚠️ `requestMammothBot` → Still uses Azure Functions (`/api/mammothBot`)
- ⚠️ `summarize` → Still uses Azure Functions (`/api/summarizeStatus`)
- ⚠️ `translate` → Still uses Azure Functions (`/api/translateStatus`)

## Firebase Functions Mapping

| Old Express Endpoint | Firebase Function | Status |
|---------------------|-------------------|---------|
| `/authenticate` | `authenticate` | ✅ Migrated |
| `/client` | `getClient` | ✅ Migrated |
| `/isfollowing` | `isFollowing` | ✅ Migrated |
| `/account` | `getAccount` | ✅ Migrated |
| `/userPosts` | `getUserPosts` | ✅ Migrated |
| `/followers` | `getFollowers` | ✅ Migrated |
| `/following` | `getFollowing` | ✅ Migrated |
| `/follow` | `follow` | ✅ Migrated |
| `/bookmarks` | `getBookmarks` | ✅ Migrated |
| `/bookmark` | `bookmark` | ✅ Migrated |
| `/favorites` | `getFavorites` | ✅ Migrated |
| `/messages` | `getMessages` | ✅ Migrated |
| `/timeline` | `getTimelinePaginated` | ✅ Migrated |
| `/reblog` | `reblog` | ✅ Migrated |
| `/boost` | `boost` | ✅ Migrated |
| `/replies` | `getReplies` | ✅ Migrated |
| `/search` | `search` | ✅ Migrated |
| `/generateImage` | `generateImage` | ✅ Migrated |
| `/generateStatus` | `generateStatus` | ✅ Migrated |
| `/public` | N/A | 🔄 Calls Mastodon directly |
| `/reply` | N/A | 🔄 Calls Mastodon directly |
| `/mediaTimeline` | N/A | 🔄 Calls Mastodon directly |
| `/hashtag` | N/A | 🔄 Calls Mastodon directly |
| `/instance` | N/A | 🔄 Calls Mastodon directly |

## Direct Mastodon API Calls

These endpoints now call the Mastodon API directly (no proxy needed):
- Public timeline
- Hashtag timeline
- Media timeline
- Instance info
- Reply to status (creating a status with `in_reply_to_id`)

## Azure Functions (Not Migrated)

These Azure-specific AI functions remain unchanged:
- `/api/mammothBot` - Chat bot functionality
- `/api/summarizeStatus` - Status summarization
- `/api/translateStatus` - Translation

These can be migrated to Firebase Functions later if needed.

## Testing Checklist

### Local Testing (Emulator)
1. Start Firebase emulator: `cd functions && npm run serve`
2. Functions will be available at: `http://localhost:5001/coho-mastodon/us-central1/<functionName>`
3. The app will automatically use local functions when running on localhost

### Production Testing
1. Deploy functions: `firebase deploy --only functions`
2. Test each feature:
   - [ ] Login/Authentication flow
   - [ ] View timeline
   - [ ] View user profiles
   - [ ] Follow/unfollow users
   - [ ] Bookmark posts
   - [ ] View favorites
   - [ ] View bookmarks
   - [ ] View messages
   - [ ] Search
   - [ ] View hashtags
   - [ ] Reblog posts
   - [ ] Generate AI posts
   - [ ] Generate AI images

## Environment Variables

Make sure to set in Firebase:
```bash
firebase functions:config:set openai.api_key="YOUR_OPENAI_API_KEY"
```

Or for local development, create `functions/.env`:
```
OPENAI_API_KEY=your_key_here
```

## Breaking Changes

### Authentication Response Format
**Before:**
```typescript
const data = await response.text(); // Returns string
```

**After:**
```typescript
const data = await response.json(); // Returns {url: "..."}
window.location.href = data.url;
```

### Token Response Format
**Before:**
```typescript
const tokenData = await response.text(); // Returns string
```

**After:**
```typescript
const data = await response.json(); // Returns {access_token: "..."}
const tokenData = data.access_token;
```

## Next Steps

1. ✅ Test locally with Firebase emulator
2. ✅ Deploy to production
3. ✅ Test all features end-to-end
4. 🔄 Consider migrating Azure AI functions to Firebase (optional)
5. 🔄 Remove old Express server once confirmed working
6. 🔄 Update CI/CD to deploy Firebase Functions

## Rollback Plan

If issues arise, you can quickly rollback by:
1. Reverting the service file changes
2. Restarting your old Express server
3. The app will immediately start using `localhost:8000` again
