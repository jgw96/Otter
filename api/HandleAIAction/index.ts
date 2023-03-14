import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
    });
    const openai = new OpenAIApi(configuration);

    const data = new Promise(async (resolve) => {
        if (req.query.type && req.query.type === "create_image") {
            const response = await openai.createImage({
                prompt: (req.query.prompt as string),
                response_format: "b64_json"
            })

            resolve(response.data)
        }
        else if (req.query.type && req.query.type === "generate_status") {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Generate a post for Mastodon that is about: ${req.query.prompt}`,
                max_tokens: 50,
                temperature: 0,
            });

            resolve(response.data)
        }
        else if (req.query.type && req.query.type === "summarize_status") {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Summarize what the following Mastodon post is saying: ${req.query.prompt}`,
                max_tokens: 50,
                temperature: 0,
            });

            resolve(response.data)
        }
    })

    context.res = {
        status: 200,
        body: await data
    };
};

export default httpTrigger;