const endpoint = "https://mammoth-ai.cognitiveservices.azure.com/";
const key = "a38533c238474e93999c8898e8d7419b";

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