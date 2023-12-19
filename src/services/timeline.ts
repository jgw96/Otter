import { get, set } from 'idb-keyval';
import { getUsersPosts } from './account';

let token = localStorage.getItem('token') || '';
let accessToken = localStorage.getItem('accessToken') || '';
let server = localStorage.getItem('server') || 'mastodon.social';

// when the app unloads, call savePlace
window.addEventListener('beforeunload', async () => {
    await savePlace(lastPageID);
});

export const savePlace = async (id: string) => {
    const formData = new FormData();
    formData.append("home[last_read_id]", id);

    const response = await fetch(`https://${server}/api/v1/markers`, {
        method: 'POST',
        headers: new Headers({
            "Authorization": `Bearer ${accessToken}`
        }),
        body: formData
    });

    const data = await response.json();

    lastPageID = data[data.length - 1].id;
}

export const getHomeTimeline = async () => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/timeline?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

let lastPageID = "";
let lastPreviewPageID = "";

export const mixTimeline = async (type = "home") => {
    // const home = await getPaginatedHomeTimeline(type);
    // const trending = await getTrendingStatuses();

    const potentialCached = await get("latest-mixed-timeline");
    if (potentialCached && potentialCached.length > 0) {
        return potentialCached;
    }

    // run getPaginatedHomeTimeline and getTrendingStatuses in parallel
    const [home, trending, searched] = await Promise.all([getPaginatedHomeTimeline(type), getTrendingStatuses(), addSomeInterestFinds()]);

    let timeline = home.concat(trending);
    let timeline2 = timeline.concat(searched);

    set("latest-mixed-timeline", timeline2);

    return timeline2;
}

export const addSomeInterestFinds = async () => {
    const { get } = await import('idb-keyval');
    const interests = await get('interests');

    if (interests && interests.length > 0) {
        const interest = interests[Math.floor(Math.random() * interests.length)];

        let accessToken = localStorage.getItem('accessToken') || '';
        const headers = new Headers({
            "Authorization": `Bearer ${accessToken}`
        });

        const response = await fetch(`https://${server}/api/v2/search?q=${interest}&resolve=true&limit=5&type=accounts`, {
            method: 'GET',
            headers: accessToken.length > 0 ? headers : new Headers({})
        });
        const data = await response.json();

        console.log("interest data", data)

        if (data.accounts && data.accounts.length > 0) {
            // get statuses from account
            const account = data.accounts[Math.floor(Math.random() * data.accounts.length)];

            // get posts from account
            const posts = await getUsersPosts(account.id);

            return posts.slice(0, 5);
        }
        else {
            return [];
        }
    }
    else {
        return [];
    }
}

export const getPreviewTimeline = async () => {
    if (lastPreviewPageID && lastPreviewPageID.length > 0) {
        const response = await fetch(`https://mastodon.social/api/v1/timelines/public?limit=10&max_id=${lastPreviewPageID}`);
        const data = await response.json();

        lastPreviewPageID = data[data.length - 1].id;

        return data;
    }

    const response = await fetch('https://mastodon.social/api/v1/timelines/public');
    const data = await response.json();

    lastPreviewPageID = data[data.length - 1].id;

    return data;
}

export const getTrendingLinks = async () => {
        let accessToken = localStorage.getItem('accessToken') || '';
        const headers = new Headers({
            "Authorization": `Bearer ${accessToken}`
        });


        const response = await fetch(`https://${server}/api/v1/trends/links?limit=10`, {
            method: 'GET',
            headers: accessToken.length > 0 ? headers : new Headers({})
        });

        const data = await response.json();

        return data;

}

export const resetLastPageID = (): Promise<void> => {
    return new Promise((resolve) => {
        lastPageID = "";
        resolve();
    })
}

export const getPaginatedHomeTimeline = async (type = "home") => {
    console.log("getPaginatedHomeTimeline", type);
    console.log("LOOK HERE", type)

    try {
        handlePeriodic();
    }
    catch(err) {
        console.log(err);
    }

    const headers = new Headers({
        "Authorization": `Bearer ${accessToken}`
    });

    if (lastPageID && lastPageID.length > 0) {
        console.log("LOOK HERE", type);
        let accessToken = localStorage.getItem('accessToken') || '';

        if (type === "for you") {
            type = "home";
        }

        const response = await fetch(`https://${server}/api/v1/timelines/${type}?limit=10&max_id=${lastPageID}`, {
            method: 'GET',
            headers: accessToken.length > 0 ? headers : new Headers({})
        });

        const data = await response.json();

        lastPageID = data[data.length - 1].id;

        return data;
    }
    else {
        console.log("LOOK HERE", type)
        let accessToken = localStorage.getItem('accessToken') || '';

        if (type === "for you") {
            type = "home";
        }

        const response = await fetch(`https://${server}/api/v1/timelines/${type}?limit=10`, {
            method: 'GET',
            headers: accessToken.length > 0 ? headers : new Headers({})
        });

        const data = await response.json();

        console.log("LOOK HERE", data);

        lastPageID = data[data.length - 1].id;

        return data;
    }
}

export const getPublicTimeline = async () => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/public?code=${token}&server=${server}`);
    const data = await response.json();
    return data;
}

export const boostPost = async (id: string) => {
    // const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/boost?id=${id}&code=${accessToken}&server=${server}`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // });
    // const data = await response.json();
    // return data;

    let accessToken = localStorage.getItem('accessToken') || '';

    // boost post
    const response = await fetch(`https://${server}/api/v1/statuses/${id}/favourite`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`

        })
    })

    const data = await response.json();
    return data;
}

export const reblogPost = async (id: string) => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/reblog?id=${id}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const getReplies = async (id: string) => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/replies?id=${id}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const reply = async (id: string, reply: string) => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/reply?id=${id}&text=${reply}&code=${accessToken}&server=${server}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export const mediaTimeline = async () => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/mediaTimeline?limit=40&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
};

export const searchTimeline = async (query: string) => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/search?query=${query}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getHashtagTimeline = async (hashtag: string) => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/hashtag?tag=${hashtag}&code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
}

export const getAStatus = async (id: string) => {
    console.log("reply id", id)
    // get a specific status
    const response = await fetch('https://' + server + '/api/v1/statuses/' + id, {
        method: 'GET',
        headers: new Headers({
            'Authorization': `Bearer ${accessToken}`
        })
    });

    console.log("reply response", response);

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

async function handlePeriodic() {
    const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
        try {
            const tags = await (registration.periodicSync as any).getTags();

            if (tags.includes('timeline-sync') === false) {
                await (registration.periodicSync as any).register('timeline-sync', {
                    // An interval of one day.
                    minInterval: 24 * 60 * 60 * 1000,
                });
            }
        } catch (error) {
            // Periodic background sync cannot be used.
            return error;
        }
    }
}
