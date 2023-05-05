
const VERSION = 1;

// import * as navigationPreload from 'workbox-navigation-preload';
import { NetworkFirst, NetworkOnly, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { registerRoute } from 'workbox-routing';
import { precacheAndRoute } from 'workbox-precaching';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// importScripts(
//     'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
// );

// Enable navigation preload for supporting browsers
// navigationPreload.enable();

importScripts(
    // idb-keyval
    'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js'
)

addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        // @ts-ignore
        self.skipWaiting();
    }
});

// Listen to the widgetinstall event.
self.addEventListener("widgetinstall", (event) => {
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
const bgSyncPlugin = new BackgroundSyncPlugin('retryqueue', {
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

registerRoute(
    '/share',
    shareTargetHandler,
    'POST'
);

// background sync
registerRoute(
    ({ request }) => request.url.includes('/boost?id'),
    new NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

registerRoute(
    ({ request }) => request.url.includes('/reblog?id'),
    new NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

registerRoute(
    ({ request }) => request.url.includes('/bookmark?id'),
    new NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

registerRoute(
    ({ request }) => request.url.includes('/status?status'),
    new NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);

// runtime caching
registerRoute(
    ({ request }) => request.url.includes('/timelines/home'),
    new NetworkFirst({
        cacheName: 'timeline',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                // maxAgeSeconds for 30 minutes
                maxAgeSeconds: 60 * 30,
            }),
        ],
    })
);

registerRoute(
    ({ request }) => request.url.includes('/bookmarks'),
    new StaleWhileRevalidate({
        cacheName: 'bookmarks',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            })
        ],
    })
);

registerRoute(
    ({ request }) => request.url.includes('/favorites'),
    new StaleWhileRevalidate({
        cacheName: 'favorites',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            })
        ],
    })
);

registerRoute(
    ({ request }) => request.url.includes('/notifications'),
    () => {
        // self.setAppBadge()
    }
)

registerRoute(
    ({ request }) => request.url.includes('/notifications'),
    new StaleWhileRevalidate({
        cacheName: 'notifications',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            })
        ],
    })
);

registerRoute(
    ({ request }) => request.url.includes('/search'),
    new StaleWhileRevalidate({
        cacheName: 'search',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
);

// avatar photos
registerRoute(
    ({ request }) => request.url.includes('/accounts/avatars'),
    new CacheFirst({
        cacheName: 'avatar',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
);

registerRoute(
    ({ request }) => request.url.includes('/user?code'),
    new CacheFirst({
        cacheName: 'user',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
);

registerRoute(
    ({ request }) => request.url.includes('/isfollowing'),
    new StaleWhileRevalidate({
        cacheName: 'user',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    })
)

precacheAndRoute(self.__WB_MANIFEST || []);