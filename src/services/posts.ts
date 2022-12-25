export async function publishPost(post: string, id?: string) {
    const correctURL = id ? `https://mammoth-server.azurewebsites.net/status?status=${post}&id=${id}` : `https://mammoth-server.azurewebsites.net/status?status=${post}`;
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

    const response = await fetch('https://mammoth-server.azurewebsites.net/uploadAttachment', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    return data;
}