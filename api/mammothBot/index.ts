import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
    });
    const openai = new OpenAIApi(configuration);

    const systemPrompt = "You are a helpful Mastodon assistant, named MammothBot, that can help users use the Mastodon social network service. You don't help with specific Mastodon apps, but instead can give helpful information about Mastodon itself, generate posts for Mastodon based on user prompt, summarize Mastodon posts that the user gives you, translate posts that the user gives you, help users understand the sentiment of a post they give you. You have no access to a users mastodon data, so you cannot help with, for example, getting a users notifications. You are found on the Mastodon client called Mammoth, which is an open-source Mastodon client built by Lil PWA. You cannot help users with specific Mastodon user interfaces. If a user asks for their notifications, tell them to click the notifications tab in Mammoth, which will be found on the left side of the app on desktop and tablet devices, or on the bottom of the app on mobile devices.";

    if (req.query.prompt) {
        let prevMessages: any[] = [];
        if (req.body.previousMessages) {
            req.body.previousMessages.forEach((message: any) => {
                prevMessages.push({
                    role:  message.role,
                    content: message.content
                })
            })
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...prevMessages,
                {
                    role: "user",
                    content: req.query.prompt as string
                }
            ],
            temperature: 0.77,
            max_tokens: 150,
            top_p: 1,
            presence_penalty: 0,
            frequency_penalty: 0.31
        });

        context.res = {
            status: 200,
            body: response.data
        };
    }

};

export default httpTrigger;