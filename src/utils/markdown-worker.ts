import { marked } from 'marked';

onmessage = (e) => {
    const markdownString = e.data

    const parsed = marked.parse(markdownString);
    console.log("parsed: ", parsed)

    const escaped = escape(parsed);

    postMessage(escaped);
};