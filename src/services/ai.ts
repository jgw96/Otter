import { FIREBASE_FUNCTIONS_BASE_URL } from '../config/firebase';

// const endpoint = "https://mammoth-ai.cognitiveservices.azure.com/";
// const key = "a38533c238474e93999c8898e8d7419b";

// const visionEndpoint = "https://mammoth-vision.cognitiveservices.azure.com/";
// const visionKey = "8362308c1d174ffca10ca1eb77b1314f";

export const requestMammothBot = async (prompt: string, previousMessages: any[]) => {
    // This uses Azure Functions - keep as is for now
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
    // This uses Azure Functions - keep as is for now
    const response = await fetch(`/api/summarizeStatus?prompt=${prompt}`, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

export const translate = async (prompt: string, language: string = "en-us") => {
    // This uses Azure Functions - keep as is for now
    const response = await fetch(`/api/translateStatus?prompt=${prompt}&language=${language}`, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

export const createAPost = async (prompt: string) => {
    // Use Firebase Function
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/generateStatus?prompt=${prompt}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

export const createImage = async (prompt: string) => {
    // Use Firebase Function
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/generateImage?prompt=${prompt}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data;
}

// export const analyzeStatusImage = async (image: string) => {
//     const response = await fetch(`${visionEndpoint}/computervision/imageanalysis:analyze?api-version=2022-10-12-preview&features=Read,Description`, {
//         method: "POST",
//         headers: new Headers({
//             "Content-Type": "application/json",
//             "Ocp-Apim-Subscription-Key": visionKey
//         }),
//         body: JSON.stringify({
//             url: image
//         })
//     });

//     const data = await response.json();
//     console.log(data);

//     return data;
// }

// export const analyzeStatusText = async (text: string) => {
//     const response = await fetch(`${endpoint}/language/:analyze-text?api-version=2022-05-01`, {
//         method: "POST",
//         headers: new Headers({
//             "Content-Type": "application/json",
//             "Ocp-Apim-Subscription-Key": key
//         }),
//         body: JSON.stringify(
//             {
//                 "kind": "EntityLinking",
//                 "parameters": {
//                     "modelVersion": "latest"
//                 },
//                 "analysisInput": {
//                     "documents": [
//                         {
//                             "id": "1",
//                             "language": "en",
//                             "text": text
//                         }
//                     ]
//                 }
//             }
//         )
//     })

//     const data = await response.json();
//     console.log(data);

//     return data;
// }