import { set } from 'idb-keyval';
import { FIREBASE_FUNCTIONS_BASE_URL } from '../config/firebase';

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
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/isFollowing?id=${id}&code=${accessToken}&server=${server}`);
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
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getAccount?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();

    console.log("account data", data)
    return data;
};

export const getUsersPosts = async (id: string) => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getUserPosts?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getUsersFollowers = async (id: string) => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getFollowers?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getFollowing = async (id: string) => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getFollowing?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const followUser = async (id: string) => {
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/follow?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}

export const getInstanceInfo = async () => {
    // This function doesn't exist in the old server either, calling Mastodon API directly
    const response = await fetch(`https://${server}/api/v1/instance`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    return data;
}

export const initAuth = async (serverURL: string) => {
    const redirect_uri = location.origin;
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/authenticate?server=${serverURL}&redirect_uri=${redirect_uri}`, {
        method: 'POST'
    });

    const data = await response.json();
    console.log("data", data)

    // Firebase function returns {url: "..."}
    window.location.href = data.url || data;

    localStorage.setItem('server', serverURL);

    server = serverURL;

    return;
}

// @ts-ignore
export const authToClient = async (code: string, state: string) => {
    try {
        token = code;
        localStorage.setItem('token', code);
        const redirect_uri = location.origin;

        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getClient?code=${token}&state=${state}&redirect_uri=${redirect_uri}`, {
            method: 'POST'
        });

        const data = await response.json();

        console.log("tokenData", data);

        // Firebase function returns {access_token: "..."}
        const tokenData = data.access_token || data;

        // Update both localStorage and IndexedDB
        localStorage.setItem('accessToken', tokenData);
        await set('accessToken', tokenData);

        // Update module-level variable
        accessToken = tokenData;

        // try to get user info
        try {
            const userData = await getCurrentUser();
            console.log("user data", userData)
            return tokenData;
        }
        catch (err) {
            console.error("Error getting user info", err)
            return tokenData;
        }

    }
    catch (err) {
        console.error("Auth to client error", err)
        throw err;
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