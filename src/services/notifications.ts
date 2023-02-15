let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getNotifications = async () => {
    const notifyResponse = await fetch(`https://mammoth-backend.azurewebsites.net/notifications?code=${accessToken}&server=${server}`);
    const data = await notifyResponse.json();
    return data;
}

export const clearNotifications = async () => {
    const response = await fetch(`https://mammothserver.azurewebsites.net/clearNotifications?code=${accessToken}&server=${server}`, {
        method: 'POST',
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
        body: JSON.stringify(subscription)
    });
    const res = await response.json();
    console.log('subToPush', res);
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