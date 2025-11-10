# Quick Start: Firebase Functions Deployment

## 1. Set Environment Variable

```bash
firebase functions:config:set openai.api_key="YOUR_OPENAI_API_KEY"
```

## 2. Deploy Functions

```bash
firebase deploy --only functions
```

This will deploy all 27 functions to Firebase.

## 3. Verify Deployment

After deployment, you'll see output like:
```
✔  functions[generateImage(us-central1)] Successful create operation.
✔  functions[generateStatus(us-central1)] Successful create operation.
✔  functions[bookmark(us-central1)] Successful create operation.
...
```

Your functions will be available at:
```
https://us-central1-coho-mastodon.cloudfunctions.net/<functionName>
```

## 4. Test the App

1. Open your app in production (not localhost)
2. Try logging in to a Mastodon instance
3. Test timeline, profiles, and AI features

## 5. Local Development

To test locally with Firebase emulator:

```bash
# Terminal 1: Start Firebase emulator
cd functions
npm run serve

# Terminal 2: Start your app
npm run dev
```

The app will automatically use:
- **Local (localhost)**: `http://localhost:5001/coho-mastodon/us-central1/`
- **Production**: `https://us-central1-coho-mastodon.cloudfunctions.net/`

## Deployed Functions

All 27 functions:
- `generateImage`
- `generateStatus`
- `bookmark`
- `reblog`
- `boost`
- `follow`
- `getStatus`
- `postStatus`
- `isFollowing`
- `getMessages`
- `getReplies`
- `getUserPosts`
- `getAccount`
- `getHashtags`
- `search`
- `getFollowing`
- `getFollowers`
- `getFavorites`
- `getBookmarks`
- `getNotifications`
- `getTimelinePaginated`
- `getUser`
- `authenticate`
- `getClient`

## Troubleshooting

### Functions not working?
1. Check Firebase Console → Functions for errors
2. Check browser console for network errors
3. Verify CORS headers are present
4. Check OpenAI API key is set

### Authentication not working?
The auth flow has changed slightly:
- `authenticate` now returns `{url: "..."}`
- `getClient` now returns `{access_token: "..."}`

Check `src/services/account.ts` for the updated implementation.

### AI features not working?
Make sure OpenAI API key is configured:
```bash
firebase functions:config:get
```

Should show:
```json
{
  "openai": {
    "api_key": "sk-..."
  }
}
```

## Cost Estimation

Firebase Functions pricing:
- First 2M invocations/month: FREE
- First 400K GB-sec compute: FREE
- First 200K CPU-sec compute: FREE

For a small-to-medium Mastodon client, this should stay within free tier.

## Monitoring

View function logs:
```bash
firebase functions:log
```

Or in Firebase Console:
- Go to Functions section
- Click on a function
- View Logs tab
