if (!(process.env.TELEGRAM_BOT_SECRET && process.env.TELEGRAM_BOT_NAME)) {
  console.error(
    "TELEGRAM_BOT_SECRET and TELEGRAM_BOT_NAME must be specified as an environment variable.",
  );
}

import { Api, Bot, Context, InlineKeyboard } from "grammy";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "@grammyjs/hydrate";
import type { InlineQueryResultArticle } from "grammy/types";

import { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

type Poll = {
  _id: Id<"poll">;
  title: string;
};

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

export function createBot(convexCtx: ActionCtx) {
  const bot = new Bot<MyContext, MyApi>(process.env.TELEGRAM_BOT_SECRET!);

  bot.use(hydrateContext());
  bot.api.config.use(hydrateApi());

  // TODO: explain how to use the bot
  bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

  // bot.command("polls", async (ctx) => {
  //   const telegramUserId = ctx.from?.id;
  //   if (!telegramUserId) return ctx.reply("who?");

  //   const polls = await getTelegramUserPolls(telegramUserId);
  //   if (polls.length) {
  //     ctx.reply(`You have ${polls.length} polls:`);
  //     for (const poll of polls) {
  //       ctx.reply(getPollLink(poll), { parse_mode: "MarkdownV2" });
  //     }
  //   } else {
  //     ctx.reply("You have no polls.");
  //   }
  // });

  // bot.command("test", async (ctx) => {
  //   console.log("HEY");
  //   const message = await ctx.reply("uhh...");
  //   setTimeout(() => {
  //     message.editText("Yeah...");
  //   }, 1000);
  // });

  function pollToAnswer(poll: Poll) {
    return {
      type: "article",
      id: `${poll._id}`,
      title: poll.title || "untitled poll",
      // description: poll.candidates
      //   .map((candidate) => candidate.name)
      //   .join(", "),
      input_message_content: {
        message_text: getPollLink(poll),
        parse_mode: "MarkdownV2",
      },
      reply_markup: new InlineKeyboard().text("Just a moment..."),
    } as InlineQueryResultArticle;
  }

  bot.on("inline_query", async (telegramCtx) => {
    if (telegramCtx.from == null) return null;
    const { query } = telegramCtx.inlineQuery;

    if (query) {
      const poll = await convexCtx.runQuery(api.poll.get, {
        id: query as Id<"poll">,
      });
      if (poll) {
        const { id, first_name, last_name, username } = telegramCtx.from;
        const userId = await convexCtx.runMutation(api.telegram.user.upsert, {
          user: { id, first_name, last_name, username },
        });
        await convexCtx.runMutation(api.telegram.poll.claim, {
          pollId: poll._id,
          userId,
        });
        return telegramCtx.answerInlineQuery([pollToAnswer(poll)]);
      }
    }

    telegramCtx.answerInlineQuery([], {
      button: {
        text: "Make a new poll",
        web_app: {
          url: `${process.env.TELEGRAM_MINI_APP_URL}/telegram/polls/new`,
        },
      },
      cache_time: 0,
    });
  });

  function getPollTitle(poll: Poll) {
    return poll.title || "[untitled poll]";
  }

  function getPollLink(poll: Poll) {
    return `[${getPollTitle(poll)}](t.me/${
      process.env.TELEGRAM_BOT_NAME
    }/app?startapp=${poll._id})`;
  }

  function makePollMessage(poll: Poll) {
    // const resultsText = poll.results
    //   .map(
    //     (result) =>
    //       `${result.round + 1}: ${result.candidate.name}: ${result.finalVotes}`,
    //   )
    //   .join("\n");
    const resultsText = ""; // TODO
    return `${getPollLink(poll)}\n${resultsText}`;
  }

  bot.on("chosen_inline_result", async (ctx) => {
    const { result_id, inline_message_id } = ctx.chosenInlineResult;
    if (!(result_id && inline_message_id)) return;

    const poll = await convexCtx.runQuery(api.poll.get, {
      id: result_id as Id<"poll">,
    });
    if (!poll) return;

    const messageText = makePollMessage(poll);
    await bot.api.editMessageTextInline(inline_message_id, messageText, {
      parse_mode: "MarkdownV2",
    });
    await convexCtx.runMutation(api.telegram.poll.addInlineMessage, {
      pollId: poll._id,
      inlineMessageId: inline_message_id,
      messageText,
    });
  });

  // Redis
  // const redisClient = new Redis();
  // redisClient.on("message", async (channel, message) => {
  //   if (channel == pollRecalculatedChannelName) {
  //     const pollId = JSON.parse(message) as Poll["id"];
  //     // now how do we update the poll in telegram?  Oh, we should store the message IDs for it in the database.
  //     // For now, perhaps we just console log to prove the message came through, though.
  //     const poll = await getPollResultsForTelegram(pollId);
  //     if (!poll) return;

  //     const text = makePollMessage(poll);
  //     for (const inlineMessage of poll.telegramInlineMessages) {
  //       const { inlineMessageId } = inlineMessage;
  //       const oldText = await getInlineMessage(pollId, inlineMessageId);
  //       if (oldText == text) continue;
  //       await bot.api.editMessageTextInline(inlineMessageId, text, {
  //         parse_mode: "MarkdownV2",
  //       });
  //       await updateInlineMessage(pollId, inlineMessageId, text);
  //     }
  //   }
  // });

  // redisClient.subscribe(pollRecalculatedChannelName, (err) => {
  //   if (err) console.log("failed to subscribe", err);
  // });

  bot.catch((error) => {
    console.error(error);
  });

  return bot;
}
