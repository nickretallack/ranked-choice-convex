import { httpAction } from "./_generated/server";
import { webhookCallback } from "grammy";
import { createBot } from "./bot";

export const webhook = httpAction(async (ctx, req) => {
  const bot = createBot(ctx);
  const handleUpdate = webhookCallback(bot, "std/http");

  try {
    const url = new URL(req.url);
    if (url.searchParams.get("token") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
    return new Response();
  }
});

export default webhook;
