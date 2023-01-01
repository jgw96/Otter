// https://mammoth-server.azurewebsites.net

let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getCurrentUser = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/user?code=' + token + '&server=' + server);
    const data = await response.json();
    return data;
}

export const getAccount = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/account?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
};

export const getUsersPosts = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/userPosts?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getUsersFollowers = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/followers?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getFollowing = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/following?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const followUser = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/follow?id=${id}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}

export const getInstanceInfo = async () => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/instance?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const initAuth = async (serverURL: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/authenticate?server=https://${serverURL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json();

    window.location.href = data;

    localStorage.setItem('server', serverURL);

    server = serverURL;

    return;
}

export const authToClient = async (code: string) => {
    token = code;
    localStorage.setItem('token', code);

    await fetch(`https://mammoth-server.azurewebsites.net/client?code=${code}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
}