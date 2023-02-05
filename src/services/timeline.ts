let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

let latestHomeTimelineData: any[] = [];

export const getHomeTimeline = async () => {
    const response = await fetch('https://mammoth-backend.azurewebsites.net/timeline?code=${token}&server=${server}');
    const data = await response.json();
    return data;
}

let lastPageID = "";

export const getPaginatedHomeTimeline = async (cache?: boolean) => {
    if (cache && latestHomeTimelineData.length > 0) {
        return latestHomeTimelineData;
    }
    else if (cache && latestHomeTimelineData.length === 0) {
        const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?limit=40&code=${token}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data]

        return data;
    }
    if (lastPageID && lastPageID.length > 0) {
        const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?since_id=${lastPageID}&limit=40&code=${token}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data]

        return data;
    }
    else {
        const response = await fetch(`https://mammoth-backend.azurewebsites.net/timelinePaginated?limit=40&code=${token}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data]

        return data;
    }
}

export const getPublicTimeline = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/public?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const boostPost = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/boost?id=${id}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const reblogPost = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/reblog?id=${id}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const getReplies = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/replies?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const reply = async (id: string, reply: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/reply?id=${id}&text=${reply}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const mediaTimeline = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/mediaTimeline?limit=40&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
};

export const searchTimeline = async (query: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/search?query=${query}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getHashtagTimeline = async (hashtag: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/hashtag?tag=${hashtag}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getAStatus = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/getstatus?id=${id}&code=${token}&server=${server}`, {
        method: 'GET',
    });
    const data = await response.json();

    return data;
}