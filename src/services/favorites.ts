export const getFavorites = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/favorites');
    const data = await response.json();
    return data;
};