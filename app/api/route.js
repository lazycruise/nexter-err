// Ably Token Authentication API
import Ably from "ably/promises";

export async function GET(request) {
  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: "chat-with-ai",
  });
  return Response.json(tokenRequestData);
}
