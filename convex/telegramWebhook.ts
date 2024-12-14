import { httpAction } from "./_generated/server";
import { Bot, webhookCallback } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_SECRET!);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date().toISOString()}`));

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
