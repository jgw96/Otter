const VERSION = 1;

importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Listen to the widgetinstall event.
self.addEventListener("widgetinstall", event => {
    // The widget just got installed, render it using renderWidget.
    // Pass the event.widget object to the function.
    event.waitUntil(renderWidget(event.widget));
});

const renderWidget = async (widget) => {
    // Get the template and data URLs from the widget definition.
    const templateUrl = widget.definition.msAcTemplate;
    const dataUrl = widget.definition.data;

    // Fetch the template text and data.
    const template = await (await fetch(templateUrl)).text();
    const data = await (await fetch(dataUrl)).text();

    // Render the widget with the template and data.
    await self.widgets.updateByTag(widget.definition.tag, { template, data });
}

self.addEventListener('push', (event) => {
    if (event.data) {
        console.log('This push event has data: ', event.data.json());

        const notifData = event.data.json();

        const promiseChain = self.registration.showNotification("Mammoth", {
            body: `You have a new ${notifData.type} from ${notifData.account.username}`,
        });
        event.waitUntil(promiseChain);
    } else {
        console.log('This push event has no data.');
    }
});

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('retryqueue', {
    maxRetentionTime: 48 * 60,
});

async function shareTargetHandler({ event }) {
    const formData = await event.request.formData();
    const mediaFiles = formData.getAll("image");
    const cache = await caches.open("shareTarget");

    for (const mediaFile of mediaFiles) {
        await cache.put(
            // TODO: Handle scenarios in which mediaFile.name isn't set,
            // or doesn't include a proper extension.
            mediaFile.name,
            new Response(mediaFile, {
                headers: {
                    "content-length": mediaFile.size,
                    "content-type": mediaFile.type,
                },
            })
        );
    }

    return Response.redirect(`/home?name=${mediaFiles[0].name}`, 303);
}

workbox.routing.registerRoute(
    '/?share',
    shareTargetHandler,
    'POST'
);

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
        // self.setAppBadge()
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

workbox.routing.registerRoute(
    ({ request }) => request.url.includes('/isfollowing'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'user',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
)

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);