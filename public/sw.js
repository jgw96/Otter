const VERSION = 1;
const CACHE_VERSION = `v${VERSION}`;

// Cache names
const CACHE_NAMES = {
  navigations: `navigations-${CACHE_VERSION}`,
  root: `root-${CACHE_VERSION}`,
  avatar: `avatar-${CACHE_VERSION}`,
  user: `user-${CACHE_VERSION}`,
  timeline: `timeline-${CACHE_VERSION}`,
  notifications: `notifications-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  shareTarget: `shareTarget-${CACHE_VERSION}`,
  precache: `precache-${CACHE_VERSION}`,
};

// Background sync queue for offline requests
const SYNC_QUEUE_NAME = 'retryqueue';
let failedRequests = [];

// Import idb-keyval for storage
importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

// Enable navigation preload if supported
if (self.registration && self.registration.navigationPreload) {
  self.registration.navigationPreload.enable();
}

// Cache expiration helper
class CacheExpiration {
  constructor(cacheName, config = {}) {
    this.cacheName = cacheName;
    this.maxEntries = config.maxEntries || 50;
    this.maxAgeSeconds = config.maxAgeSeconds || null;
  }

  async expireEntries() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();
    const now = Date.now();

    // Sort by timestamp (oldest first)
    const requestsWithTime = await Promise.all(
      requests.map(async (request) => {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('date');
        const cachedTime = dateHeader ? new Date(dateHeader).getTime() : now;
        return { request, cachedTime };
      })
    );

    requestsWithTime.sort((a, b) => a.cachedTime - b.cachedTime);

    // Remove entries exceeding maxEntries
    if (this.maxEntries && requestsWithTime.length > this.maxEntries) {
      const entriesToDelete = requestsWithTime.slice(0, requestsWithTime.length - this.maxEntries);
      await Promise.all(entriesToDelete.map(({ request }) => cache.delete(request)));
    }

    // Remove entries older than maxAgeSeconds
    if (this.maxAgeSeconds) {
      const maxAge = this.maxAgeSeconds * 1000;
      const expiredEntries = requestsWithTime.filter(
        ({ cachedTime }) => now - cachedTime > maxAge
      );
      await Promise.all(expiredEntries.map(({ request }) => cache.delete(request)));
    }
  }

  async updateTimestamp(request) {
    // Timestamp is already in the response headers
  }
}

// Caching strategies

// Network First: Try network, fall back to cache
async function networkFirst(request, cacheName, expirationConfig) {
  const cache = await caches.open(cacheName);
  
  try {
    // Try to use navigation preload response if available
    const preloadResponse = await self.registration?.navigationPreload?.getState()
      .then(state => state.enabled ? event.preloadResponse : null)
      .catch(() => null);

    const networkResponse = preloadResponse || await fetch(request);
    
    // Clone the response before caching
    const responseToCache = networkResponse.clone();
    await cache.put(request, responseToCache);
    
    // Expire old entries if configured
    if (expirationConfig) {
      const expiration = new CacheExpiration(cacheName, expirationConfig);
      await expiration.expireEntries();
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First: Try cache, fall back to network
async function cacheFirst(request, cacheName, expirationConfig) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const responseToCache = networkResponse.clone();
    await cache.put(request, responseToCache);
    
    // Expire old entries if configured
    if (expirationConfig) {
      const expiration = new CacheExpiration(cacheName, expirationConfig);
      await expiration.expireEntries();
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Network Only: Only use network, with background sync support
async function networkOnly(request, useBackgroundSync = false) {
  try {
    return await fetch(request);
  } catch (error) {
    if (useBackgroundSync) {
      // Store failed request for later retry
      const requestData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: request.method !== 'GET' ? await request.clone().text() : null,
        timestamp: Date.now(),
      };
      failedRequests.push(requestData);
      
      // Try to register background sync
      if ('sync' in self.registration) {
        await self.registration.sync.register(SYNC_QUEUE_NAME);
      }
    }
    throw error;
  }
}

// Message handler
addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Widget install handler
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(renderWidget(event.widget));
});

const renderWidget = async (widget) => {
  const templateUrl = widget.definition.msAcTemplate;
  const dataUrl = widget.definition.data;

  const template = await (await fetch(templateUrl)).text();
  const data = await (await fetch(dataUrl)).text();

  await self.widgets.updateByTag(widget.definition.tag, { template, data });
};

// Background sync handler
self.addEventListener('sync', async (event) => {
  if (event.tag === SYNC_QUEUE_NAME) {
    event.waitUntil(replayFailedRequests());
  }
});

async function replayFailedRequests() {
  const requestsToRetry = [...failedRequests];
  failedRequests = [];

  for (const requestData of requestsToRetry) {
    try {
      const init = {
        method: requestData.method,
        headers: requestData.headers,
      };
      
      if (requestData.body) {
        init.body = requestData.body;
      }
      
      await fetch(requestData.url, init);
    } catch (error) {
      // If still failing, add back to queue
      failedRequests.push(requestData);
    }
  }
  
  // If there are still failed requests, re-register sync
  if (failedRequests.length > 0 && 'sync' in self.registration) {
    await self.registration.sync.register(SYNC_QUEUE_NAME);
  }
}

// Helper functions for API calls
const followAUser = async (id) => {
  const accessToken = await self.idbKeyval.get('accessToken');
  const server = await self.idbKeyval.get('server');

  await fetch(`https://${server}/api/v1/accounts/${id}/follow`, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
  });
};

const timelineSync = async () => {
  return new Promise(async (resolve) => {
    const accessToken = await self.idbKeyval.get('accessToken');
    const server = await self.idbKeyval.get('server');

    const timelineResponse = await fetch(`https://${server}/api/v1/timelines/home`, {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
    });

    const data = await timelineResponse.json();
    await self.idbKeyval.set('timeline-cache', data);

    resolve();
  });
};

const getNotifications = async () => {
  const accessToken = await self.idbKeyval.get('accessToken');
  const server = await self.idbKeyval.get('server');

  const notifyResponse = await fetch(`https://${server}/api/v1/notifications`, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
  });

  const data = await notifyResponse.json();
  const notifyCheck = data.length > 0 ? true : false;

  return new Promise((resolve) => {
    if (notifyCheck) {
      navigator.setAppBadge(data.length);

      let message = '';
      let actions = [];
      let title = 'Otter';
      
      switch (data[0].type) {
        case 'mention':
          message = `${data[0].status.content}`;
          title = `${data[0].account.display_name} mentioned you`;
          break;
        case 'reblog':
          message = `${data[0].account.display_name} boosted your post`;
          break;
        case 'favourite':
          message = `${data[0].account.display_name} favorited your post`;
          break;
        case 'follow':
          message = `${data[0].account.display_name} followed you`;
          title = 'New Follower';
          actions = [
            {
              action: 'follow',
              title: 'Follow back',
            },
          ];
          break;
        default:
          message = `You have ${data.length} new notifications`;
          break;
      }

      const notify = self.registration.showNotification(title, {
        body: message,
        icon: '/assets/icons/Android/256-icon.png',
        tag: 'otter',
        renotify: false,
        actions: actions,
        data: {
          url: data[0].account.url,
          accountId: data[0].account.id,
        },
      });

      resolve();
    }
  });
};

// Push notification handler
self.addEventListener('push', async (event) => {
  const data = event.data.json();

  navigator.setAppBadge(data.length);

  let message = '';
  let actions = [];
  let title = 'Otter';
  
  switch (data[0].type) {
    case 'mention':
      message = `${data[0].status.content}`;
      title = `${data[0].account.display_name} mentioned you`;
      break;
    case 'reblog':
      message = `${data[0].account.display_name} boosted your post`;
      break;
    case 'favourite':
      message = `${data[0].account.display_name} favorited your post`;
      break;
    case 'follow':
      message = `${data[0].account.display_name} followed you`;
      title = 'New Follower';
      actions = [
        {
          action: 'follow',
          title: 'Follow back',
        },
      ];
      break;
    default:
      message = `You have ${data.length} new notifications`;
      break;
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: '/assets/icons/Android/256-icon.png',
      tag: 'otter',
      renotify: false,
      actions: actions,
      data: {
        url: data[0].account.url,
        accountId: data[0].account.id,
      },
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  navigator.clearAppBadge();

  if (event.action === 'follow' && event.notification.data.accountId) {
    event.waitUntil(followAUser(event.notification.data.accountId));
  }

  event.waitUntil(clients.openWindow('/home?tab=notifications'));
});

// Periodic background sync
self.addEventListener('periodicsync', async (event) => {
  switch (event.tag) {
    case 'get-notifications':
      event.waitUntil(getNotifications());
      break;
    case 'timeline-sync':
      event.waitUntil(timelineSync());
      break;
    default:
      break;
  }
});

// Share target handler
async function shareTargetHandler(request) {
  const formData = await request.formData();
  const mediaFiles = formData.getAll('image');
  const cache = await caches.open(CACHE_NAMES.shareTarget);

  for (const mediaFile of mediaFiles) {
    await cache.put(
      mediaFile.name,
      new Response(mediaFile, {
        headers: {
          'content-length': mediaFile.size,
          'content-type': mediaFile.type,
        },
      })
    );
  }

  return Response.redirect(`/home?name=${mediaFiles[0].name}`, 303);
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Share target route
  if (url.pathname === '/share' && request.method === 'POST') {
    event.respondWith(shareTargetHandler(request));
    return;
  }

  // Navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.navigations, null)
    );
    return;
  }

  // Index.html
  if (url.pathname === '/index.html' || url.pathname === '/') {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.root, {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 5, // 5 days
      })
    );
    return;
  }

  // Background sync routes
  const bgSyncPatterns = ['/boost?id', '/reblog?id', '/bookmark?id', '/status?status'];
  if (request.method === 'POST' && bgSyncPatterns.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(networkOnly(request, true));
    return;
  }

  // Avatar photos
  if (url.pathname.includes('/accounts/avatars')) {
    event.respondWith(
      cacheFirst(request, CACHE_NAMES.avatar, {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      })
    );
    return;
  }

  // User data
  if (url.pathname.includes('/user?code')) {
    event.respondWith(
      cacheFirst(request, CACHE_NAMES.user, {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      })
    );
    return;
  }

  // Timeline API
  if (url.pathname.includes('/api/v1/timelines') && request.method === 'GET') {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.timeline, {
        maxEntries: 50,
        maxAgeSeconds: 60 * 5, // 5 minutes
      })
    );
    return;
  }

  // Notifications API
  if (url.pathname.includes('/api/v1/notifications') && request.method === 'GET') {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.notifications, {
        maxEntries: 50,
        maxAgeSeconds: 60 * 5, // 5 minutes
      })
    );
    return;
  }

  // Local image assets
  if (request.destination === 'image' && url.pathname.includes('/assets/icons/')) {
    event.respondWith(
      cacheFirst(request, CACHE_NAMES.images, {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 5, // 5 days
      })
    );
    return;
  }

  // Precached assets - handled by install event
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }
});

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.precache).then((cache) => {
      // Assets will be injected here by the build process
      const assetsToCache = self.__PRECACHE_MANIFEST || [];
      return cache.addAll(assetsToCache.map(asset => typeof asset === 'string' ? asset : asset.url));
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old version caches
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  return self.clients.claim();
});
