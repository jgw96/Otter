let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getBookmarks = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/bookmarks?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const addBookmark = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/bookmark?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}