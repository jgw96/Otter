import { FIREBASE_FUNCTIONS_BASE_URL } from '../config/firebase';

let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getMessages = async () => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getMessages?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}