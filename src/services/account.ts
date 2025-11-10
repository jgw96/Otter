// http://localhost:8000/
import { set } from 'idb-keyval';
let accessToken = localStorage.getItem('accessToken') || '';
set('accessToken', accessToken);
set('server', localStorage.getItem('server') || '')

let token = localStorage.getItem('token') || '';
let server = localStorage.getItem('server') || '';

export const editAccount = async (display_name: string, note: string, locked: string, bot: string, avatar: any, header: any,  ) => {
    const currentUser = await getCurrentUser();

    const formData = new FormData();

    formData.append("display_name", display_name || currentUser.display_name);
    formData.append("note", note || currentUser.note);
    formData.append("avatar", avatar || currentUser.avatar);
    formData.append("header", header || currentUser.header);
    formData.append("locked", locked.toString() || currentUser.locked);
    formData.append("bot", bot.toString() || currentUser.bot);


    const response = await fetch(`https://${server}/api/v1/accounts/update_credentials`, {
        method: 'PATCH',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }),
        body: formData
    });

    const data = await response.json();
    return data;
}


export const getPeers = async () => {
    const response = await fetch(`https://mastodon.social/api/v1/instance/peers`);
    const data = await response.json();

    // return first 300
    return data.slice(0, 50);
}


export const checkFollowing = async (id: string) => {
    try {
        const response = await fetch(`http://localhost:8000/isfollowing?id=${id}&code=${accessToken}&server=${server}`);
        const data = await response.json();

        return data;
    }
    catch (err) {
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

        const response = await fetch('https://' + server + '/api/v1/accounts/verify_credentials', {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            })
        });

        const data = await response.json();

        currentUser = data;

        localStorage.setItem("currentUserID", currentUser.id);
        return data;
    }
    catch (err) {
        console.log(err);
        if (server) {
            // await initAuth(server);
        }
    }
}

export const unfollowUser = async (id: string) => {
    const response = await fetch(`https://${server}/api/v1/accounts/${id}/unfollow`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        })
    });

    const data = await response.json();
    return data;
}

export const getAccount = async (id: string) => {
    const response = await fetch(`http://localhost:8000/account?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();

    console.log("account data", data)
    return data;
};

export const getUsersPosts = async (id: string) => {
    const response = await fetch(`http://localhost:8000/userPosts?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getUsersFollowers = async (id: string) => {
    const response = await fetch(`http://localhost:8000/followers?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getFollowing = async (id: string) => {
    const response = await fetch(`http://localhost:8000/following?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const followUser = async (id: string) => {
    const response = await fetch(`http://localhost:8000/follow?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}

export const getInstanceInfo = async () => {
    const response = await fetch(`http://localhost:8000/instance?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const initAuth = async (serverURL: string) => {
    const redirect_uri = location.origin;
    const response = await fetch(`http://localhost:8000/authenticate?server=https://${serverURL}&redirect_uri=${redirect_uri}`, {
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
        const redirect_uri = location.origin;

        const response = await fetch(`http://localhost:8000/client?code=${token}&server=${server}&redirect_uri=${redirect_uri}`, {
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

export const registerAccount = async (username: string, email: string, password: string, agreement: boolean, locale: string, chosenServer: string) => {
    const response = await fetch(`https://${chosenServer}/api/v1/accounts`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
            username,
            email,
            password,
            agreement,
            locale
        })
    })

    const data = await response.json();
    return data;
}

export const getServers = async () => {
    const response = await fetch('https://mammoth-api-v3.azurewebsites.net/api/getOpenInstances');
    const data = await response.json();

    return data;
}

export const isFollowingMe = async (id: string) => {
       // check if you are following a user
       const response = await fetch("https://" + server + `/api/v1/accounts/relationships?id=${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    return data;
}