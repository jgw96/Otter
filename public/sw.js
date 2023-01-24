importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('retryqueue', {
    maxRetentionTime: 48 * 60,
});

// background sync
workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/boost?id'),
    new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/reblog?id'),
    new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/bookmark?id'),
    new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/status?status'),
    new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

// runtime caching
workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/timelinePaginated'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'timeline',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                // maxAgeSeconds for 30 minutes
                maxAgeSeconds: 60 * 30,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/bookmarks'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'bookmarks',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            })
        ],
    })
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/favorites'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'favorites',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            })
        ],
    })
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/notifications'),
    () => {
        self.setAppBadge()
    }
)

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/notifications'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'notifications',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            })
        ],
    })
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/search'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'search',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
);

// avatar photos
workbox.routing.registerRoute(
    ({ request }) => request.url.includes('link.storjshare.io'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'avatar',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/user?code'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'user',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
);

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);