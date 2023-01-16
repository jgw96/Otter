let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getNotifications = async () => {
    const response = await fetch(`https://mammothserver.azurewebsites.net/notifications?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const clearNotifications = async () => {
    const response = await fetch('https://mammothserver.azurewebsites.net/clearNotifications?code=${token}&server=${server}', {
        method: 'POST',
    });
    const data = await response.json();
    return data;
}