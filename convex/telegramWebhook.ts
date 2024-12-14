import { httpAction } from "./_generated/server";
import { Bot, webhookCallback } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_SECRET!);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date().toISOString()}`));

const handleUpdate = webhookCallback(bot, "std/http");

export const webhook = httpAction(async (ctx, req) => {
  req.headers.forEach((value, key) => {
    console.log(key, value);
  });
  return await handleUpdate(req);
});

export default webhook;
