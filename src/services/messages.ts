let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getMessages = async () => {
    const response = await fetch(`http://localhost:8000/messages?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}