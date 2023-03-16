import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        prompt: `Generate a post for Mastodon that is about: ${req.query.prompt}`,
        max_tokens: 100,
        temperature: 0,
    });

    context.res = {
        status: 200,
        body: response.data
    };
};

export default httpTrigger;