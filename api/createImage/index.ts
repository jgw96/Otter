import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createImage({
        prompt: (req.query.prompt as string),
        response_format: "b64_json"
    });

    context.res = {
        status: 200,
        body: response.data
    };

};

export default httpTrigger;