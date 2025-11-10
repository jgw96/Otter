let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getBookmarks = async () => {
    const response = await fetch(`http://localhost:8000/bookmarks?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const addBookmark = async (id: string) => {
    const response = await fetch(`http://localhost:8000/bookmark?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}