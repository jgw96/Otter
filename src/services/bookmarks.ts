let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getBookmarks = async () => {
    const response = await fetch(`http://localhost:8080/bookmarks?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const addBookmark = async (id: string) => {
    const response = await fetch(`http://localhost:8080/bookmark?id=${id}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}