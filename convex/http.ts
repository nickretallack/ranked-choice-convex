import { httpRouter } from "convex/server";
import { webhook } from "./telegramWebhook";

const http = httpRouter();

http.route({
  path: "/telegram/bot/webhook",
  method: "POST",
  handler: webhook,
});

export default http;
