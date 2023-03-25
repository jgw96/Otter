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
                content: "You can summarize social media posts"
            },
            {
                role: "user",
                content: `Summarize the following post: ${req.query.prompt as string}`
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
};

export default httpTrigger;