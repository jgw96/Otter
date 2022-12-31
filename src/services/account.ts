// https://mammoth-server.azurewebsites.net

let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const getCurrentUser = async () => {
    const response = await fetch('http://localhost:8080/user?code=' + token + '&server=' + server);
    const data = await response.json();
    return data;
}

export const getAccount = async (id: string) => {
    const response = await fetch(`http://localhost:8080/account?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
};

export const getUsersPosts = async (id: string) => {
    const response = await fetch(`http://localhost:8080/userPosts?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getUsersFollowers = async (id: string) => {
    const response = await fetch(`http://localhost:8080/followers?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const followUser = async (id: string) => {
    const response = await fetch(`http://localhost:8080/follow?id=${id}&code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getInstanceInfo = async () => {
    const response = await fetch(`http://localhost:8080/instance?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const initAuth = async (serverURL: string) => {
    const response = await fetch(`http://localhost:8080/authenticate?server=https://${serverURL}`, {
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

    await fetch(`http://localhost:8080/client?code=${code}&code=${token}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
}