export const getBookmarks = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/bookmarks');
    const data = await response.json();
    return data;
}

export const addBookmark = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/bookmark?id=${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}