import { httpRouter } from "convex/server";
import { auth } from "./auth";
import discordWebhook from "./discord/webhook";
import telegramWebhook from "./telegram/webhook";

const http = httpRouter();
auth.addHttpRoutes(http);

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
