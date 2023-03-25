const endpoint = "https://mammoth-ai.cognitiveservices.azure.com/";
const key = "a38533c238474e93999c8898e8d7419b";

const visionEndpoint = "https://mammoth-vision.cognitiveservices.azure.com/";
const visionKey = "8362308c1d174ffca10ca1eb77b1314f";

export const requestMammothBot = async (prompt: string, previousMessages: any[]) => {
    const response = await fetch(`/api/mammothBot?prompt=${prompt}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            previousMessages: previousMessages
        })
    });
    const data = await response.json();

    return data;
};

export const summarize = async (prompt: string) => {
    // https://wonderful-glacier-07b022d1e.2.azurestaticapps.net/api/summarizeStatus?prompt=Its%20crazy%20how%20twitter%20will%20just%20demand%20justification%20if%20you%20decide%20to%20not%20use%20a%20certain%20tool,%20especially%20by%20people%20who%20are%20not%20even%20working%20on%20the%20project,%20and%20will%20be%20in%20no%20way%20affected%20by%20the%20author%E2%80%99s%20decision.The%20weirdest%20argument%20in%20the%20jsdoc%20vs%20ts%20types%20discussion%20is%20claiming%20that%20writing%20jsdoc%20is%20%22writing%20manual%20types%22.%20Are%20you...%20not%20writing%20the%20types%20when%20you%20use%20TS?%20Wtf%20does%20this%20even%20mean?
    const response = await fetch(`/api/summarizeStatus?prompt=${prompt}`, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

export const createAPost = async (prompt: string) => {
    const response = await fetch(`/api/HandleAIAction?prompt=${prompt}`, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

export const createImage = async (prompt: string) => {
    const response = await fetch(`/api/createImage?prompt=${prompt}`, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

export const analyzeStatusImage = async (image: string) => {
    const response = await fetch(`${visionEndpoint}/computervision/imageanalysis:analyze?api-version=2022-10-12-preview&features=Read,Description`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": visionKey
        }),
        body: JSON.stringify({
            url: image
        })
    });

    const data = await response.json();
    console.log(data);

    return data;
}

export const analyzeStatusText = async (text: string) => {
    const response = await fetch(`${endpoint}/language/:analyze-text?api-version=2022-05-01`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": key
        }),
        body: JSON.stringify(
            {
                "kind": "EntityLinking",
                "parameters": {
                    "modelVersion": "latest"
                },
                "analysisInput": {
                    "documents": [
                        {
                            "id": "1",
                            "language": "en",
                            "text": text
                        }
                    ]
                }
            }
        )
    })

    const data = await response.json();
    console.log(data);

    return data;
}