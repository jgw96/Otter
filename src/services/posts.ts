import { fileOpen } from "browser-fs-access";

let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export async function publishPost(post: string, id?: string) {
    const correctURL = id ? `https://mammoth-backend.azurewebsites.net/status?status=${post}&id=${id}&code=${token}&server=${server}` : `https://mammoth-backend.azurewebsites.net/status?status=${post}&code=${token}&server=${server}`;
    const response = await fetch(correctURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}

export async function uploadImageAsFormData() {
    const file = await fileOpen({
        mimeTypes: ['image/*'],
        multiple: false,
    })

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`https://mammoth-backend.azurewebsites.net/uploadAttachment?code=${token}&server=${server}`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    return data;
}