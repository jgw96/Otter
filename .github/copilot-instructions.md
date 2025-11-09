# Otter - Mastodon PWA Development Guide

## Project Overview
Otter is a Progressive Web App (PWA) Mastodon client built with Lit web components, emphasizing offline capabilities, AI features, and cross-platform deployment. The app uses a custom router, service workers for offline support, and Azure Functions for AI features.

## Architecture

### Frontend Stack
- **Framework**: Lit 3.x with TypeScript decorators (`@customElement`, `@state`, `@property`)
- **Component Pattern**: Web Components using Lit's `LitElement` base class
- **Routing**: `@thepassle/app-tools/router` with lazy loading and custom transition plugin
- **UI Libraries**: Shoelace components (`@shoelace-style/shoelace`), Fluent UI (`@fluentui/web-components`)
- **Build Tool**: Vite with PWA plugin, WASM support, and terser minification

### Component Structure
All components follow this pattern:
```typescript
@customElement('component-name')
export class ComponentName extends LitElement {
  @state() privateState: Type;
  @property() publicProp: Type;
  static get styles() { return css`...`; }
  render() { return html`...`; }
}
```

Key components are in `src/components/` and pages in `src/pages/`. Services are stateless modules in `src/services/`.

### Data Layer
- **Local Storage**: Authentication tokens (`accessToken`, `server`) stored in both `localStorage` and `idb-keyval`
- **IndexedDB**: Settings and offline data via `idb-keyval` library
- **Mastodon API**: Direct REST API calls to user's chosen instance, authenticated with Bearer tokens
- **WebSocket**: Real-time timeline updates via `timeline-worker.ts` connecting to Mastodon streaming API

### Backend (Azure Functions)
API functions in `api/` directory are Azure Functions (Node.js):
- `HandleAIAction/`: OpenAI integration for post generation
- `createImage/`: AI image generation
- `mammothBot/`: AI assistant features
- `summarizeStatus/`, `translateStatus/`: Content processing

All functions use pattern:
```typescript
const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
  // Logic here
  context.res = { status: 200, body: data };
};
```

## Development Workflows

### Local Development
```bash
npm run dev          # Start Vite dev server on port 3000
npm run dev-server   # Same as above (alias)
npm run start        # Alias for dev
npm run build        # TypeScript compile + Vite production build
```

### Testing
```bash
npm test                    # Run Playwright tests
npm run start-for-tests     # Build and serve for testing
```

### Azure Functions Development
```bash
cd api
npm install
npm run build        # Compile TypeScript
npm start            # Start Azure Functions locally (func start)
```

Or use VS Code task: "func: host start" (handles install, build, and start).

### Deployment
```bash
npm run deploy  # Deploy to Azure Static Web Apps using SWA CLI
```

Configuration in `swa-cli.config.json` specifies app location, output dir (`dist`), and dev server URL.

## Key Conventions

### Mastodon API Integration
- Server and token stored globally: `let server = localStorage.getItem('server')` pattern in all service files
- API base URL: `https://${server}/api/v1/...`
- All requests include `Authorization: Bearer ${accessToken}` header
- FormData used for POST requests with media/complex data

### Service Layer Pattern
Services in `src/services/` are stateless utility modules:
- Import tokens/server at module top
- Export async functions that return data directly
- Example: `posts.ts` exports `publishPost()`, `replyToPost()`, `deletePost()`

### Routing and Navigation
Routes defined in `src/utils/router.ts`:
- Lazy load page components with `lazy(() => import('./pages/...'))`
- Custom transition plugin (`transition-plugin.ts`) for View Transitions API
- Navigate via `router.navigate('/path')` or `Router.go('/path')`

### Web Workers
- `timeline-worker.ts`: WebSocket connection for real-time timeline updates
- `markdown-worker.ts`: Markdown parsing off main thread
- `img-worker.ts`: Image processing (blurhash) off main thread
- Workers imported with Vite's `?worker` suffix

### Service Worker (`public/sw.js`)
- Workbox-based with custom logic
- Strategies: NetworkFirst for navigation, CacheFirst for assets
- Background sync for failed requests (`retryqueue`)
- Custom widget rendering for Windows PWA widgets
- Precaching via `precacheAndRoute(self.__WB_MANIFEST)`

### Settings Management
Settings interface in `src/services/settings.ts`:
```typescript
interface Settings {
  primary_color?: string;
  font_size?: string;
  data_saver?: boolean;
  wellness?: boolean;
  focus?: boolean;
  sensitive?: boolean;
}
```
- Stored in IndexedDB via `idb-keyval`
- Applied in `app-index.ts` on app load
- CSS custom properties updated dynamically

### Styling Patterns
- Shared styles in `src/styles/shared-styles.ts`
- Shoelace CSS custom properties for theming (`--sl-color-primary-600`)
- Theme colors stored in `light.css`, `dark.css`, `global.css` (copied to dist by Vite)
- Responsive breakpoint: `@media(max-width: 600px)`

### State Management
- Component-level `@state()` for private reactive state
- No global state library - state passed via properties or events
- Timeline data managed in `Timeline` component, paginated via service calls

## Important Files

- `src/app-index.ts`: Root component, handles theme initialization
- `src/utils/router.ts`: Route definitions and lazy loading
- `src/components/timeline.ts`: Main timeline component with virtualization (`@lit-labs/virtualizer`)
- `src/services/posts.ts`: Core Mastodon posting logic
- `public/sw.js`: Service worker with Workbox and custom offline logic
- `vite.config.ts`: Build configuration with PWA, WASM, and copy plugins
- `swa-cli.config.json`: Azure Static Web Apps deployment config

## Testing
Playwright tests in `tests/` directory. Config in `playwright.config.ts` with 30s timeout, parallel execution, and retry on CI.

## Common Pitfalls
- Always check both `localStorage` and `idb-keyval` for tokens (service worker uses IndexedDB)
- Components must import Shoelace/Fluent components before use
- Web Workers need top-level await support (modern browsers only)
- Service worker precache manifest injected by Vite plugin at build time
- Azure Functions require `OPENAI_TOKEN` env variable for AI features

## AI Integration

### Frontend AI Services (`src/services/ai.ts`)
All AI features proxy through Azure Functions to protect API keys:

```typescript
// Generate post from prompt
await createAPost(prompt);  // -> /api/HandleAIAction

// Summarize a status
await summarize(statusText);  // -> /api/summarizeStatus

// Translate content
await translate(text, "en-us");  // -> /api/translateStatus

// Generate images
await createImage(prompt);  // -> /api/createImage

// Chat with AI bot
await requestMammothBot(prompt, previousMessages);  // -> /api/mammothBot
```

### Backend AI Functions
Each Azure Function follows this pattern:
1. Accept query params or POST body
2. Call OpenAI API with `process.env.OPENAI_TOKEN`
3. Return formatted response in `context.res`

Example: `api/HandleAIAction/index.ts` uses GPT-3.5-turbo with specific temperature/token settings for post generation.

## Offline & PWA Features

### Service Worker Architecture (`public/sw.js`)
- **Precaching**: Vite injects `self.__WB_MANIFEST` at build time with all static assets
- **Runtime Caching**: NetworkFirst for navigation, CacheFirst for assets
- **Background Sync**: Failed requests queued in `retryqueue` with 48hr retention
- **Push Notifications**: Mastodon notifications trigger native OS notifications with action buttons (follow/open)
- **Badge API**: Unread count displayed on app icon via `navigator.setAppBadge()`
- **Widget Support**: Windows PWA widgets rendered via `renderWidget()` using Adaptive Cards templates

### Dual Token Storage Pattern
Critical for offline functionality:
```typescript
// Frontend (src/services/*.ts)
let accessToken = localStorage.getItem('accessToken');
let server = localStorage.getItem('server');

// Service Worker (public/sw.js)
const accessToken = await self.idbKeyval.get('accessToken');
const server = await self.idbKeyval.get('server');
```
Both locations must be updated when user logs in (see `src/services/account.ts`).

### PWA Manifest Features (`public/manifest.json`)
- **Display Override**: `window-controls-overlay` for native title bar integration
- **Shortcuts**: 5 app shortcuts (Home, Explore, Notifications, Messages, New Post)
- **Share Target**: Can receive shared text/images from other apps via `share_target`
- **Widgets**: Windows PWA widget definition with template/data URLs
- **Icons**: Maskable, monochrome, and any purpose icons for adaptive display

## Theming System

### Theme Architecture
1. **CSS Variables**: Shoelace design tokens (`--sl-color-*`) defined in `index.html`
2. **Theme Files**: `light.css`, `dark.css`, `global.css` copied to dist by Vite
3. **Dynamic Updates**: Settings changes update CSS custom properties at runtime

### Setting Primary Color
```typescript
// In app-index.ts on load
const settings = await getSettings();
if (settings.primary_color) {
  document.body.style.setProperty('--sl-color-primary-600', settings.primary_color);
  document.querySelector("html")!.style.setProperty('--primary-color', settings.primary_color);
}
```

### Theme Component (`src/components/app-theme.ts`)
- Provides UI for selecting predefined colors or custom color picker
- Updates settings via `setSettings({ primary_color: newColor })`
- Changes apply immediately via CSS custom property updates

### Responsive Styling
All components use consistent breakpoint:
```css
@media(max-width: 600px) {
  /* Mobile styles */
}
```

## Common Task Examples

### Adding a New Page
1. Create component in `src/pages/app-newpage.ts`:
```typescript
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-newpage')
export class AppNewPage extends LitElement {
  static styles = css`/* styles */`;
  render() { return html`<div>Content</div>`; }
}
```

2. Add route in `src/utils/router.ts`:
```typescript
{
  path: '/newpage',
  title: 'New Page',
  plugins: [lazy(() => import('../pages/app-newpage.js'))],
  render: () => html`<app-newpage></app-newpage>`
}
```

3. Navigate with `router.navigate('/newpage')` or `<a href="/newpage">`

### Creating a Service Function
Pattern in `src/services/`:
```typescript
// At top of file
let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

// Export async function
export async function doSomething(param: string) {
  const response = await fetch(`https://${server}/api/v1/endpoint`, {
    method: 'GET',
    headers: new Headers({
      "Authorization": `Bearer ${accessToken}`
    })
  });
  const data = await response.json();
  return data;
}
```

### Using Web Workers
Import with Vite's `?worker` suffix:
```typescript
import MyWorker from './utils/my-worker?worker';

const worker = new MyWorker();
worker.postMessage({ action: 'start', data: someData });
worker.onmessage = (e) => {
  console.log('Worker result:', e.data);
};
```

Worker file uses top-level await (modern browsers only):
```typescript
// my-worker.ts
import { get } from 'idb-keyval';

const token = await get('accessToken');

onmessage = (e) => {
  // Process message
  postMessage(result);
};
```

### Adding Shoelace/Fluent Components
Always import before use:
```typescript
// Shoelace
import '@shoelace-style/shoelace/dist/components/button/button.js';

// Fluent UI
import { fluentButton, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentButton());
```

### Implementing Timeline Pagination
Use pattern from `src/components/timeline.ts`:
```typescript
@state() timeline: Post[] = [];
@state() loadingData: boolean = false;

async loadMore() {
  this.loadingData = true;
  const newPosts = await getPaginatedHomeTimeline(this.timeline[this.timeline.length - 1].id);
  this.timeline = [...this.timeline, ...newPosts];
  this.loadingData = false;
}
```

### Handling Settings Updates
```typescript
import { getSettings, setSettings } from './services/settings';

// Read settings
const settings = await getSettings();
if (settings.data_saver) {
  // Handle data saver mode
}

// Update settings
await setSettings({
  data_saver: true,
  wellness: false
});
```

## Key Architectural Decisions

### Why No Global State Library?
- Lit's reactive properties handle component state
- Settings/tokens in IndexedDB accessed directly when needed
- Event-driven communication between components via custom events
- Keeps bundle size small and reduces complexity

### Why Web Workers for Timeline?
- WebSocket connection runs in `timeline-worker.ts` to keep main thread responsive
- Real-time updates post messages to main thread
- Pattern: Worker manages persistent WebSocket, component manages UI updates

### Why Dual Token Storage?
- Service Worker can't access localStorage (different context)
- Both contexts need tokens for API calls
- Solution: Store in both localStorage (frontend) and IndexedDB (service worker)

### Why FormData for Mastodon API?
- Mastodon API expects multipart/form-data for posts with attachments
- Simpler than manually constructing multipart requests
- Example in `src/services/posts.ts`: `publishPost()`, `editPost()`

### Why Copy CSS Files to Dist?
- Theme files (`light.css`, `dark.css`) need to be accessible at runtime
- Loaded dynamically based on user preference
- Vite plugin copies them: `rollup-plugin-copy` in `vite.config.ts`

## Debugging Tips

### Testing Service Worker Locally
1. Run `npm run build` to generate manifest
2. Service worker only fully active in production mode
3. Check Application > Service Workers in DevTools
4. Use "Update on reload" during development

### Testing PWA Installation
1. Must serve over HTTPS (or localhost)
2. Check manifest validity in DevTools > Application > Manifest
3. Install criteria: manifest + service worker + valid icons

### Azure Functions Local Testing
1. Start functions: `cd api && npm start` (or VS Code task)
2. Functions available at `http://localhost:7071/api/[functionName]`
3. Update frontend API calls to localhost for testing
4. Requires `.env` with `OPENAI_TOKEN` for AI features

### Timeline WebSocket Issues
1. Check browser console for WebSocket errors
2. Verify `accessToken` and `server` in IndexedDB (worker uses this)
3. Worker file: `src/utils/timeline-worker.ts`
4. Mastodon streaming endpoint: `wss://${server}/api/v1/streaming`

### Component Not Updating?
1. Verify `@state()` for reactive properties
2. Use `this.requestUpdate()` to force re-render
3. Array/object mutations don't trigger updates - reassign instead: `this.items = [...this.items, newItem]`
