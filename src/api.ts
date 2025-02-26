import axios from "axios";
export async function sendToGrok(
  apiKey: string,
  model: string,
  content: string
): Promise<any> {
  const response = await axios.post(
    "https://api.x.ai/v1/chat/completions",
    {
      messages: [{ role: "user", content }],
      model,
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
