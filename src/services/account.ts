// https://mammoth-server.azurewebsites.net/

let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const checkFollowing = async (id: string)  => {
    try {
        const response = await fetch(`https://mammoth-server.azurewebsites.net/isfollowing?id=${id}`);
        const data = await response.json();

        return data;
    }
    catch(err) {
        if (server) {
            await initAuth(server);
        }
    }
}

export const getCurrentUser = async () => {
    try {
        console.log("calling")
        const response = await fetch('https://mammoth-server.azurewebsites.net/user?code=' + token + '&server=' + server);
        const data = await response.json();
        return data;
    }
    catch (err) {
        if (server) {
            await initAuth(server);
        }
    }
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
    try {

        const response = await fetch(`https://mammoth-server.azurewebsites.net/client?code=${code}&server=${server}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const tokenData = await response.json();

        console.log("tokenData", tokenData)

        token = tokenData;
        localStorage.setItem('token', tokenData);

        // try to get user info
        try {
             await getCurrentUser();
             return tokenData;
        }
        catch (err) {
            console.error("prrrrrrrrroblems", err)
            await initAuth(server);
        }

    }
    catch (err) {
        console.error("prrrrrrrrroblems", err)
        await initAuth(server);
    }
}