let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getNotifications = async () => {
    // const notifyResponse = await fetch(`http://localhost:8000/notifications?code=${accessToken}&server=${server}`);
    // const data = await notifyResponse.json();
    // return data;

    // get notifications from mastodon api
    const notifyResponse = await fetch(`https://${server}/api/v1/notifications`, {
        method: 'GET',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await notifyResponse.json();
    return data;
}

export const clearNotifications = async () => {
    // const response = await fetch(`https://mammothserver.azurewebsites.net/clearNotifications?code=${accessToken}&server=${server}`, {
    //     method: 'POST',
    // });
    // const data = await response.json();
    // return data;

    // clear notifications from mastodon api
    const response = await fetch(`https://${server}/api/v1/notifications/clear`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await response.json();
    return data;
}

function urlBase64ToUint8Array(key: string) {
    const padding = '='.repeat((4 - key.length % 4) % 4);
    const base64 = (key + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const subToPush = async () => {
    // get push subscription
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array("BCC4QfjFdiAxT48FxxKUrTn4K6PJS17W76g6ccUs1JUqy5cLzLEjfNW61ezEz928wP-t3ywtRNaD41U5yWNo_4s")
    });

    if (!subscription) {
        return;
    }

    const response = await fetch(`https://${server}/api/v1/push/subscription`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({
            subscription: subscription,
            data: {
                alerts: {
                    follow: true,
                    reblog: true,
                    favourite: true,
                    mention: true,
                },
                policy: "all"
            }
        })
    });
    const res = await response.json();
    console.log('subToPush', res);

    // ask for permission to show notifications
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        // show notification
        registration?.showNotification("Otter", {
            body: "You have successfully subscribed to push notifications!",
            icon: "/assets/icons/128-icon.png",
            tag: "mammoth-subscribe"
        });
    }

    if (res) {
        try {

            // set minInterval to twice a day
            const minInterval = 12 * 60 * 60 * 1000;

            // @ts-ignore
            await registration.periodicSync.register("get-notifications", {
                minInterval,
            });
        } catch {
            console.log("Periodic Sync could not be registered!");
        }
    }
}

export const modifyPush = async (flags?: any[]) => {
    let data: any | undefined;
    if (flags) {
        data = {
            alerts: {
                follow: flags.includes('follow'),
                reblog: flags.includes('reblog'),
                favourite: flags.includes('favourite'),
                mention: flags.includes('mention'),
                poll: flags.includes('poll'),
                follow_request: flags.includes('follow_request')
            }
        };
    }
    else {
        data = {
            alerts: {
                follow: true,
                reblog: true,
                favourite: true,
                mention: true,
                poll: true,
                follow_request: true
            }
        };
    }

    const response = await fetch(`https://${server}/api/v1/push/subscription`, {
        method: 'PUT',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({
            data
        })
    });
    const res = await response.json();
    console.log('modifyPush', res);
}

export const unsubToPush = async () => {
    // get push subscription
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();

    if (!subscription) {
        return;
    }

    const response = await fetch(`https://${server}/api/v1/push/subscription`, {
        method: 'DELETE',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(subscription)
    });
    const res = await response.json();
    console.log('unsubToPush', res);

    await subscription.unsubscribe();
};