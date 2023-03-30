import { fileOpen } from "browser-fs-access";

let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export async function whoBoostedAndFavorited(id: string) {
    const response = await fetch(`https://${server}/api/v1/statuses/${id}/reactions`, {
        method: 'GET',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await response.json();
    return data;
}

export async function deletePost(id: string) {
    const response = await fetch(`https://${server}/api/v1/statuses/${id}`, {
        method: 'DELETE',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await response.json();
    return data;
}

export async function getPostDetail(id: string) {
    const response = await fetch(`https://${server}/api/v1/statuses/${id}`, {
        method: 'GET',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await response.json();
    return data;
}

export async function publishPost(post: string, ids?: Array<string>, sensitive: boolean = false, spoilerText: string = "") {
    const formData = new FormData();

    formData.append("status", post && post.length > 0 ? post : "");

    if (ids && ids.length > 0) {
        for(const id of ids) {
            formData.append("media_ids[]", id);
        }
    }

    if (sensitive) {
        formData.append("sensitive", "true");

        if (spoilerText && spoilerText.length > 0) {
            formData.append("spoiler_text", spoilerText);
        }
    }

    // make a fetch request to post a status using the mastodon api
    const response = await fetch(`https://${server}/api/v1/statuses`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: formData
    });

    const currentUser = localStorage.getItem("currentUserID");
    (window as any).appInsights.trackEvent({name: "posted", properties: {user: currentUser}});

    const data = await response.json();
    return data;
}

export async function replyToPost(id: string, content: string) {
    const formData = new FormData();

    formData.append("in_reply_to_id", id);

    formData.append("status", content && content.length > 0 ? content : "");

    // make a fetch request to post a status using the mastodon api
    const response = await fetch(`https://${server}/api/v1/statuses`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: formData
    });

    const currentUser = localStorage.getItem("currentUserID");
    (window as any).appInsights.trackEvent({name: "replied_to_post", properties: {user: currentUser}});

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

export async function uploadImageAsFormData(): Promise<Array<any>> {
    return new Promise(async (resolve) => {
        const files = await fileOpen({
            mimeTypes: ['image/*'],
            multiple: true,
        });
``
        let uploaded: any[] = [];

        // loop through the files and upload them

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);

            const response = await fetch(`https://${server}/api/v2/media`, {
                method: 'POST',
                headers: new Headers({
                    "Authorization": `Bearer ${accessToken}`
                }),
                body: formData
            });

            const data = await response.json();

            uploaded = [...uploaded, data];

            console.log("uploaded", uploaded)
        }

        resolve(uploaded);
    });
}