let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getFavorites = async () => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/favorites?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
};