let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getNotifications = async () => {
    const notifyResponse = await fetch(`https://mammoth-backend.azurewebsites.net/notifications?code=${token}&server=${server}`);
    const data = await notifyResponse.json();
    return data;
}

export const clearNotifications = async () => {
    const response = await fetch(`https://mammothserver.azurewebsites.net/clearNotifications?code=${token}&server=${server}`, {
        method: 'POST',
    });
    const data = await response.json();
    return data;
}

export const subToPush = async () => {
    // get token
    const tokenResponse = await fetch(`https://mammothserver.azurewebsites.net/client?code=${token}&server=${server}`, {
        method: 'POST',
    });
    const data = await tokenResponse.json();

    const response = await fetch(`${server}/api/v1/push/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authentication': `Bearer ${data}`
        },
    });
    const res = await response.json();
    console.log('subToPush', res);
}