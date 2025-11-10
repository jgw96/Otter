import { FIREBASE_FUNCTIONS_BASE_URL } from '../config/firebase';

let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getBookmarks = async () => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getBookmarks?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const addBookmark = async (id: string) => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/bookmark?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}