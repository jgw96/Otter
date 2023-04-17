const VERSION = 1;

importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

importScripts(
    // idb-keyval
    'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js'
)

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

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('retryqueue', {
    maxRetentionTime: 48 * 60,
});

const followAUser = async (id) => {
    // follow a user with the mastodon api
    const accessToken = await self.idbKeyval.get('accessToken');
    const server = await self.idbKeyval.get('server');

    await fetch(`https://${server}/api/v1/accounts/${id}/follow`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });
}

const timelineSync = async () => {
    return new Promise(async (resolve) => {
        const accessToken = await self.idbKeyval.get('accessToken');
        const server = await self.idbKeyval.get('server');

        const timelineResponse = await fetch(`https://${server}/api/v1/timelines/home`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": `Bearer ${accessToken}`
            })
        });

        const data = await timelineResponse.json();

        // store timeline in idb
        await self.idbKeyval.set('timeline-cache', data);

        resolve();
    });
}

const getNotifications = async () => {
    // get access token from idb
    const accessToken = await self.idbKeyval.get('accessToken');
    const server = await self.idbKeyval.get('server');

    const notifyResponse = await fetch(`https://${server}/api/v1/notifications`, {
        method: 'GET',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await notifyResponse.json();

    const notifyCheck = data.length > 0 ? true : false;

    return new Promise((resolve) => {
        if (notifyCheck) {
            // show badge
            navigator.setAppBadge(data.length);

            // build message for notification
            let message = '';
            let actions = [];
            let title = 'Mammoth';
            // if data[0].type === 'mention' || 'reblog' || 'favourite'
            switch (data[0].type) {
                case 'mention':
                    message = `${data[0].status.content}`;
                    title = `${data[0].account.display_name} mentioned you`

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
                    actions = [{
                        action: 'follow',
                        title: 'Follow back'
                    }];

                    break;

                default:
                    message = `You have ${data.length} new notifications`;
                    break;
            }


            // show notification
            const notify = self.registration.showNotification('Mammoth', {
                body: message,
                icon: '/assets/icons/512-icon.png',
                tag: 'mammoth',
                renotify: false,
                actions: actions,
                data: {
                    url: data[0].account.url
                }
            });

            notify.addEventListener('click', event => {
                event.notification.close();
                navigator.clearAppBadge();

                // if event.action === 'follow'
                if (event.action === 'follow') {
                    followAUser(data[0].account.id);
                }

                clients.openWindow("/home?tab=notifications");
            });

            resolve();

        }
    })

}

self.addEventListener('push', async (event) => {
    const data = event.data.json();

    // show badge
    navigator.setAppBadge(data.length);

    // build message for notification
    let message = '';
    let actions = [];
    let title = 'Mammoth';
    // if data[0].type === 'mention' || 'reblog' || 'favourite'
    switch (data[0].type) {
        case 'mention':
            message = `${data[0].status.content}`;
            title = `${data[0].account.display_name} mentioned you`

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
            actions = [{
                action: 'follow',
                title: 'Follow back'
            }];

            break;

        default:
            message = `You have ${data.length} new notifications`;
            break;
    }

    // show notification
    self.registration.showNotification('Mammoth', {
        body: message,
        icon: '/assets/icons/512-icon.png',
        tag: 'mammoth',
        renotify: false,
        actions: actions,
        data: {
            url: data[0].account.url
        }
    });
})

// periodic background sync
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

async function shareTargetHandler({ event }) {
    const formData = await event.request.formData();
    const mediaFiles = formData.getAll("image");
    const cache = await caches.open("shareTarget");

    event.waitUntil(async () => {
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
    })
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
    ({ request }) => request.url.includes('/timelines/home'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'timeline',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
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
    ({ request }) => request.url.includes('/accounts/avatars'),
    new workbox.strategies.CacheFirst({
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
    new workbox.strategies.CacheFirst({
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