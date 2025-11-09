import { marked } from 'marked';

onmessage = async (e) => {
    const markdownString = e.data

    const parsed = await marked.parse(markdownString);
    console.log("parsed: ", parsed)

    postMessage(parsed);
};