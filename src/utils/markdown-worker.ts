import { marked } from 'marked';

onmessage = (e) => {
    const markdownString = e.data

    postMessage(marked.parse(markdownString));
};