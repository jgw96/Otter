import { get } from "idb-keyval";

const accessToken = await get('accessToken');
const server = await get('server');

const socket = new WebSocket(`wss://${server}/api/v1/streaming?access_token=${accessToken}&stream=user`);

onmessage = (e) => {
    switch (e.data) {
        case 'start':
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log('timelineWorker', data);
                postMessage(data);
            }
            break;
        case 'stop':
            socket.close();
            break;

        default:
            break;
    }
}