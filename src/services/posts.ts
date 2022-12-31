let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export async function publishPost(post: string, id?: string) {
    const correctURL = id ? `http://localhost:8080/status?status=${post}&id=${id}&code=${token}&server=${server}` : `http://localhost:8080/status?status=${post}&code=${token}&server=${server}`;
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
    // open image using file system access api
    // @ts-ignore
    const fileHandle = await window.showOpenFilePicker({
        types: [
            {
                description: 'Images',
                accept: {
                    'image/*': ['.png', '.jpg', '.jpeg'],
                },
            },
        ],
    });
    const file = await fileHandle[0].getFile();

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8080/uploadAttachment?code=${token}&server=${server}', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    return data;
}