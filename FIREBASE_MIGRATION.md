# Firebase Functions Migration Guide

## Overview
All endpoints from the monolithic Express server have been ported to Firebase Functions. Each endpoint is now a separate function that can be called individually.

## Deployed Functions

### OpenAI Functions
- **generateImage** - Generate images using OpenAI DALL-E
- **generateStatus** - Generate Mastodon post text using GPT-3.5

### Mastodon API Proxy Functions
- **bookmark** - Bookmark a status
- **reblog** - Reblog/boost a status (same as boost)
- **boost** - Boost a status (same as reblog)
- **follow** - Follow a user
- **getStatus** - Get a specific status by ID
- **postStatus** - Post a new status
- **isFollowing** - Check if you're following a user
- **getMessages** - Get direct messages (conversations)
- **getReplies** - Get replies to a status
- **getUserPosts** - Get posts from a specific user
- **getAccount** - Get account information
- **getHashtags** - Search for hashtags
- **search** - General search
- **getFollowing** - Get accounts a user is following
- **getFollowers** - Get a user's followers
- **getFavorites** - Get favorited statuses
- **getBookmarks** - Get bookmarked statuses
- **getNotifications** - Get notifications
- **getTimelinePaginated** - Get paginated home timeline
- **getUser** - Get current user (verify credentials)

### Authentication Functions
- **authenticate** - Initialize OAuth flow (replaces `/authenticate`)
- **getClient** - Exchange code for access token (replaces `/client`)

## Function URLs
After deployment, functions will be available at:
```
https://<region>-<project-id>.cloudfunctions.net/<functionName>
```

Example:
```
https://us-central1-otter-pwa.cloudfunctions.net/generateImage
```

## Required Environment Variables
Set the OpenAI API key in Firebase:

```bash
firebase functions:config:set openai.api_key="YOUR_OPENAI_API_KEY"
```

Or in `.env` for local development:
```
OPENAI_API_KEY=your_key_here
```

## Frontend Changes Required

### 1. Update API Base URLs
Replace all calls to your old Express server with Firebase Function URLs.

**Old:**
```typescript
const response = await fetch('http://localhost:8000/generateImage?prompt=test');
```

**New:**
```typescript
const response = await fetch('https://us-central1-otter-pwa.cloudfunctions.net/generateImage?prompt=test');
```

### 2. Update Authentication Flow

**Old `/authenticate` endpoint:**
```typescript
const response = await fetch('http://localhost:8000/authenticate?server=mastodon.social&redirect_uri=...');
```

**New `authenticate` function:**
```typescript
const response = await fetch('https://us-central1-otter-pwa.cloudfunctions.net/authenticate?server=mastodon.social&redirect_uri=...');
const data = await response.json();
// data.url contains the authorization URL
window.location.href = data.url;
```

**Old `/client` endpoint:**
```typescript
const response = await fetch('http://localhost:8000/client?code=ABC&redirect_uri=...');
```

**New `getClient` function:**
```typescript
const response = await fetch('https://us-central1-otter-pwa.cloudfunctions.net/getClient?code=ABC&redirect_uri=...');
const data = await response.json();
// data.access_token contains the token
```

### 3. Files to Update
Search for these patterns in your codebase and update the URLs:

- `src/services/ai.ts` - Update OpenAI function calls
- `src/services/account.ts` - Update authentication calls
- `src/services/posts.ts` - Update Mastodon API proxy calls
- Any component that calls the old Express endpoints

Example grep command:
```bash
grep -r "localhost:8000" src/
```

## Local Testing

### Start Firebase Emulators
```bash
cd functions
npm run serve
```

This will start functions locally at:
```
http://localhost:5001/<project-id>/<region>/<functionName>
```

### Environment Setup
Create `functions/.env`:
```
OPENAI_API_KEY=your_key_here
```

## Deployment

### Deploy All Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:generateImage
```

## Key Differences from Express Server

1. **CORS**: All functions include CORS headers automatically
2. **State**: Functions are stateless - `clientID`, `clientSecret`, and `serverURL` are module-level variables but may not persist between invocations
3. **Error Handling**: All functions include try/catch with proper error responses
4. **Validation**: All functions validate required query parameters
5. **OPTIONS**: All functions handle CORS preflight requests

## Authentication State Management

⚠️ **Important**: The authentication flow uses module-level variables (`clientID`, `clientSecret`, `serverURL`) which may not persist between function invocations in production. Consider:

1. **Client-side storage**: Store these values in frontend localStorage after the initial `authenticate` call
2. **Database storage**: Use Firestore to persist OAuth credentials per server
3. **Passing all params**: Always send server URL with both `authenticate` and `getClient` calls

Recommended approach:
```typescript
// Step 1: Initialize auth and get URL
const authResponse = await fetch(`...authenticate?server=${server}&redirect_uri=${uri}`);
const { url, client_id, client_secret } = await authResponse.json();
localStorage.setItem('pending_client_id', client_id);
localStorage.setItem('pending_client_secret', client_secret);
window.location.href = url;

// Step 2: Exchange code for token (after redirect)
const clientId = localStorage.getItem('pending_client_id');
const clientSecret = localStorage.getItem('pending_client_secret');
const tokenResponse = await fetch(`...getClient?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&server=${server}`);
```

## Migration Checklist

- [ ] Set up Firebase project
- [ ] Configure OpenAI API key in Firebase
- [ ] Deploy functions to Firebase
- [ ] Update frontend API URLs
- [ ] Update authentication flow
- [ ] Test all endpoints
- [ ] Update any service files that reference the old server
- [ ] Remove old Express server
- [ ] Update environment variables in CI/CD
- [ ] Update documentation

## Next Steps

1. Review the authentication state management approach
2. Consider enhancing the `authenticate`/`getClient` functions to accept all required params
3. Add rate limiting if needed (Firebase Functions have built-in limits)
4. Set up monitoring and logging in Firebase Console
5. Configure function memory and timeout settings if needed
