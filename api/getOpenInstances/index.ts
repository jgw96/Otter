import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import fetch from 'node-fetch';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const response = await fetch('https://instances.social/api/1.0/instances/list?include_down=false&include_closed=false', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + process.env.INSTANCES_TOKEN
        }
    });
    const data = await response.json();
    

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: data
    };

};

export default httpTrigger;