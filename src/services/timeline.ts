let token = localStorage.getItem('token') || '';
let accessToken = localStorage.getItem('accessToken') || '';
let server = localStorage.getItem('server') || '';

let latestHomeTimelineData: any[] = [];

export const getHomeTimeline = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/timeline?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

const getFromDisk = async () => {
    console.log("getting from disk")
    const root = await navigator.storage.getDirectory();

    const fileHandle = await root.getFileHandle('mammoth.json', { create: true });
    const file = await fileHandle.getFile();

    const fileContents = await file.text();

    // if the blob is over 2mb, evict the file
    if (file.size > 2097152) {
        await root.removeEntry('mammoth.json');
    }

    if (fileContents.length === 0) return [];

    return JSON.parse(fileContents);
}

const saveToDisk = async (content: Array<any>) => {
    const blob = new Blob([JSON.stringify(content)], { type: 'application/json' });

    const root = await navigator.storage.getDirectory();

    // if the blob is over 2mb, evict the file
    if (blob.size > 2097152) {
        await root.removeEntry('mammoth.json');
    }

    const file = await root.getFileHandle('mammoth.json', { create: true });

    // @ts-ignore
    const writable = await file.createWritable();

    await writable.write(blob);

    await writable.close();

}

let lastPageID = "";

export const getPaginatedHomeTimeline = async (cache?: boolean) => {
    console.log("here 1", cache, latestHomeTimelineData.length);

    // try disk first
    const potentialData = await getFromDisk();

    if (cache) {
        console.log('here 2')

        if (potentialData.length > 0) {
            latestHomeTimelineData = potentialData;

            window.requestIdleCallback(async () => {
                // update from network when we can
                const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?limit=40&code=${accessToken}&server=${server}`);
                const data = await response.json();

                lastPageID = data[data.length - 1].id;

                latestHomeTimelineData = [...latestHomeTimelineData, ...data];

                window.requestIdleCallback(async () => {
                    await saveToDisk(latestHomeTimelineData);
                });
            })

            return potentialData;
        }
        else {
            const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?limit=40&code=${accessToken}&server=${server}`);
            const data = await response.json();

            lastPageID = data[data.length - 1].id;

            latestHomeTimelineData = [...latestHomeTimelineData, ...data];

            window.requestIdleCallback(async () => {
                await saveToDisk(latestHomeTimelineData);
            });

            return data;
        }
    }
    else if (cache && latestHomeTimelineData.length > 0) {
        return latestHomeTimelineData;
    }

    if (lastPageID && lastPageID.length > 0) {
        const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?since_id=${lastPageID}&limit=40&code=${accessToken}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data];

        window.requestIdleCallback(async () => {
            await saveToDisk(latestHomeTimelineData);
        });

        return data;
    }
    else {
        const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?limit=40&code=${accessToken}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data];

        window.requestIdleCallback(async () => {
            await saveToDisk(latestHomeTimelineData);
        });

        return data;
    }
}

export const getPublicTimeline = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/public?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const boostPost = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/boost?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const reblogPost = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/reblog?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const getReplies = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/replies?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const reply = async (id: string, reply: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/reply?id=${id}&text=${reply}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const mediaTimeline = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/mediaTimeline?limit=40&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
};

export const searchTimeline = async (query: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/search?query=${query}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getHashtagTimeline = async (hashtag: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/hashtag?tag=${hashtag}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getAStatus = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/getstatus?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'GET',
    });
    const data = await response.json();

    return data;
}