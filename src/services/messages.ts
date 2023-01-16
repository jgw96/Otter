let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getMessages = async () => {
    const response = await fetch(`https://mammothserver.azurewebsites.net/messages?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}