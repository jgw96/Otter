import { fileOpen } from "browser-fs-access";

let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export async function publishPost(post: string, id?: string) {
    const formData = new FormData();

    formData.append("status", post && post.length > 0 ? post : "");

    if (id) {
        formData.append("media_ids[]", id);
    }

    // make a fetch request to post a status using the mastodon api
    const response = await fetch(`https://${server}/api/v1/statuses`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: formData
    });

    const data = await response.json();
    return data;
}

export async function uploadImageFromURL(url: string) {
    const response = await fetch(`https://${server}/api/v2/media`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: JSON.stringify({
            url: url
        })
    });

    const data = await response.json();
    return data;
}

export async function uploadImageFromBlob(blob: Blob) {
    // const formData = new FormData();
    // formData.append('file', blob);

    const formData = new FormData();
    formData.append('file', blob);

    const response = await fetch(`https://${server}/api/v2/media`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: formData
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

    const response = await fetch(`https://${server}/api/v2/media`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: formData
    });


    // const response = await fetch(`https://mammoth-backend.azurewebsites.net/uploadAttachment?code=${accessToken}&server=${server}`, {
    //     method: 'POST',
    //     body: formData,
    // });

    const data = await response.json();
    return data;
}