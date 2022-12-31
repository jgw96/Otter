let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getHomeTimeline = async () => {
    const response = await fetch('http://localhost:8080/timeline?code=${token}&server=${server}');
    const data = await response.json();
    return data;
}

let lastPageID = "";

export const getPaginatedHomeTimeline = async () => {
    if (lastPageID && lastPageID.length > 0) {
        const response = await fetch(`http://localhost:8080/timelinePaginated?since_id=${lastPageID}&limit=40&code=${token}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;
        return data;
    }
    else {
        const response = await fetch(`http://localhost:8080/timelinePaginated?limit=40&code=${token}&server=${server}`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;
        return data;
    }
}

export const getPublicTimeline = async () => {
    const response = await fetch(`http://localhost:8080/public?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const boostPost = async (id: string) => {
    const response = await fetch(`http://localhost:8080/boost?id=${id}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const reblogPost = async (id: string) => {
    const response = await fetch(`http://localhost:8080/reblog?id=${id}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const getReplies = async (id: string) => {
    const response = await fetch(`http://localhost:8080/replies?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const reply = async (id: string, reply: string) => {
    const response = await fetch(`http://localhost:8080/reply?id=${id}&text=${reply}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const mediaTimeline = async () => {
    const response = await fetch(`http://localhost:8080/mediaTimeline?limit=40&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
};

export const searchTimeline = async (query: string) => {
    const response = await fetch(`http://localhost:8080/search?query=${query}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}