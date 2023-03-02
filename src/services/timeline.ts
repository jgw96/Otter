import { Post } from "../interfaces/Post";

let token = localStorage.getItem('token') || '';
let accessToken = localStorage.getItem('accessToken') || '';
let server = localStorage.getItem('server') || '';

let latestHomeTimelineData: Post[] = [];

export const getHomeTimeline = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/timeline?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

let lastPageID = "";

export const getPaginatedHomeTimeline = async () => {

    if (lastPageID && lastPageID.length > 0) {
        let accessToken = localStorage.getItem('accessToken') || '';

        const response = await fetch(`https://${server}/api/v1/timelines/home?limit=10&max_id=${lastPageID}`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": `Bearer ${accessToken}`
            })
        });

        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data];

        return data;
    }
    else {
        let accessToken = localStorage.getItem('accessToken') || '';

        const response = await fetch(`https://${server}/api/v1/timelines/home?limit=10`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": `Bearer ${accessToken}`
            })
        });

        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        latestHomeTimelineData = [...latestHomeTimelineData, ...data];

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

export const getTrendingStatuses = async () => {
    let accessToken = localStorage.getItem('accessToken') || '';

    const response = await fetch(`https://${server}/api/v1/trends/statuses`, {
        method: 'GET',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        })
    });

    const data = await response.json();

    return data;
}