export const getNotifications = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/notifications');
    const data = await response.json();
    return data;
}

export const clearNotifications = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/clearNotifications', {
        method: 'POST',
    });
    const data = await response.json();
    return data;
}