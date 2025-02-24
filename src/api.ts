import axios from "axios";
export async function sendToGrok(apiKey: string, prompt: string): Promise<any> {
  const response = await axios.post(
    "https://api.x.ai/v1/chat/completions",
    {
      messages: [{ role: "user", content: prompt }],
      model: "grok-2-latest",
      stream: false,
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
