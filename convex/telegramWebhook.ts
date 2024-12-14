import { httpAction } from "./_generated/server";
import { webhookCallback } from "grammy";
import bot from "./bot";

const handleUpdate = webhookCallback(bot, "std/http");

export const webhook = httpAction(async (ctx, req) => {
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
