import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You can translate social media posts"
            },
            {
                role: "user",
                content: `Translate the following post from Mastodon into ${req.query.language}: ${req.query.prompt}`
            }
        ],
        temperature: 0.77,
        max_tokens: 150,
    });

    context.res = {
        status: 200,
        body: response.data
    };
};

export default httpTrigger;