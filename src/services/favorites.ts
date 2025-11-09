let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getFavorites = async () => {
    const response = await fetch(`http://localhost:8000/favorites?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
};