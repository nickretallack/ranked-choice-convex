import { httpRouter } from "convex/server";
import discordWebhook from "./discord/webhook";
import telegramWebhook from "./telegram/webhook";

const http = httpRouter();

http.route({
  path: "/telegram/bot/webhook",
  method: "POST",
  handler: telegramWebhook,
});

http.route({
  path: "/discord/bot/webhook",
  method: "POST",
  handler: discordWebhook,
});

export default http;
