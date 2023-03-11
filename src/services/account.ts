// https://mammoth-backend.azurewebsites.net/

let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const checkFollowing = async (id: string)  => {
    try {
        const response = await fetch(`https://mammoth-backend.azurewebsites.net/isfollowing?id=${id}&code=${accessToken}&server=${server}`);
        const data = await response.json();

        return data;
    }
    catch(err) {
        if (server) {
            await initAuth(server);
        }
    }
}

let currentUser: any | null = null;

export const getCurrentUser = async () => {
    try {
        if (currentUser) {
            return currentUser;
        }

        console.log("calling")
        const response = await fetch('https://mammoth-backend.azurewebsites.net/user?code=' + accessToken + '&server=' + server);
        const data = await response.json();

        currentUser = data;

        return data;
    }
    catch (err) {
        console.log(err);
        if (server) {
            // await initAuth(server);
        }
    }
}

export const getAccount = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/account?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();

    console.log("account data", data)
    return data;
};

export const getUsersPosts = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/userPosts?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getUsersFollowers = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/followers?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getFollowing = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/following?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const followUser = async (id: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/follow?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}

export const getInstanceInfo = async () => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/instance?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const initAuth = async (serverURL: string) => {
    const response = await fetch(`https://mammoth-backend.azurewebsites.net/authenticate?server=https://${serverURL}`, {
        method: 'POST'
    });

    const data = await response.text();
    console.log("data", data)

    window.location.href = data;

    localStorage.setItem('server', serverURL);

    server = serverURL;

    return;
}

// @ts-ignore
export const authToClient = async (code: string) => {
    try {
        token = code;
        localStorage.setItem('token', code);

        const response = await fetch(`https://mammoth-backend.azurewebsites.net/client?code=${token}&server=${server}`, {
            method: 'POST'
        });

        const tokenData = await response.text();

        console.log("tokenData", tokenData);

        localStorage.setItem('accessToken', tokenData)

        // try to get user info
        try {
            const data = await getCurrentUser();
            console.log("data", data)
             return tokenData;
        }
        catch (err) {
            console.error("prrrrrrrrroblems", err)
            // await initAuth(server);
            return tokenData;
        }

    }
    catch (err) {
        console.error("prrrrrrrrroblems", err)
        await initAuth(server);
    }
}