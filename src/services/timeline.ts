export const getHomeTimeline = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/timeline');
    const data = await response.json();
    return data;
}

let lastPageID = "";

export const getPaginatedHomeTimeline = async () => {
    if (lastPageID && lastPageID.length > 0) {
        const response = await fetch(`https://mammoth-server.azurewebsites.net/timelinePaginated?since_id=${lastPageID}&limit=40`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;
        return data;
    }
    else {
        const response = await fetch(`https://mammoth-server.azurewebsites.net/timelinePaginated?limit=40`);
        const data = await response.json();

        lastPageID = data[data.length - 1].id;
        return data;
    }
}

export const getPublicTimeline = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/public');
    const data = await response.json();
    return data;
}

export const boostPost = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/boost?id=${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const reblogPost = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/reblog?id=${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const getReplies = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/replies?id=${id}`);
    const data = await response.json();
    return data;
}

export const reply = async (id: string, reply: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/reply?id=${id}&text=${reply}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}