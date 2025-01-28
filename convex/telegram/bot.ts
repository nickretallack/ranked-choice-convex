if (!(process.env.TELEGRAM_BOT_SECRET && process.env.TELEGRAM_BOT_NAME)) {
  console.error(
    "TELEGRAM_BOT_SECRET and TELEGRAM_BOT_NAME must be specified as an environment variable.",
  );
}

import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "@grammyjs/hydrate";
import { Api, Bot, Context, InlineKeyboard } from "grammy";
import type { InlineQueryResultArticle } from "grammy/types";

import { api } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { indexByUniqueIdentifier } from "../shared/indexByUniqueIdentifier";

type Poll = {
  _id: Id<"poll">;
  title: string;
};

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

export function createBotBase() {
  const bot = new Bot<MyContext, MyApi>(process.env.TELEGRAM_BOT_SECRET!);

  bot.use(hydrateContext());
  bot.api.config.use(hydrateApi());

  return bot;
}

function getPollTitle(poll: Poll) {
  return poll.title || "[untitled poll]";
}

function getPollLink(poll: Poll) {
  return `[${getPollTitle(poll)}](t.me/${
    process.env.TELEGRAM_BOT_NAME
  }/app?startapp=${poll._id})`;
}

export async function makePollMessage(convexCtx: ActionCtx, poll: Doc<"poll">) {
  const results = await convexCtx.runQuery(api.poll.getResults, {
    id: poll._id,
  });
  const candidates = await convexCtx.runQuery(api.candidate.list, {
    pollId: poll._id,
  });
  const candidateMap = indexByUniqueIdentifier(candidates);

  const resultText = results.eliminations
    .flatMap((elimination) =>
      Object.entries(elimination.candidates).map(([candidateId]) => {
        const candidate = candidateMap.get(candidateId)!;
        return `${candidate.name}: ${elimination.votes}`;
      }),
    )
    .reverse()
    .join("\n");

  return `${getPollLink(poll)}\n${resultText}`;
}

export async function updateInlineMessages(
  convexCtx: ActionCtx,
  pollId: Id<"poll">,
) {
  const poll = await convexCtx.runQuery(api.poll.get, {
    id: pollId,
  });
  if (!poll) throw new Error("Poll not found");

  const newText = await makePollMessage(convexCtx, poll);

  const inlineMessages = await convexCtx.runQuery(
    api.telegram.inlineMessages.list,
    {
      pollId: poll._id,
    },
  );

  const bot = createBotBase();
  for (const inlineMessage of inlineMessages) {
    if (newText == inlineMessage.messageText) continue;
    await bot.api.editMessageTextInline(
      inlineMessage.inlineMessageId,
      newText,
      {
        parse_mode: "MarkdownV2",
      },
    );
    await convexCtx.runMutation(api.telegram.inlineMessages.update, {
      id: inlineMessage._id,
      messageText: newText,
    });
  }
}

export function createBot(convexCtx: ActionCtx) {
  const bot = createBotBase();

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

  const answerInlineQueryOptions = {
    button: {
      text: "Make a new poll",
      web_app: {
        url: `${process.env.TELEGRAM_MINI_APP_URL}/telegram/polls/new`,
      },
    },
    cache_time: 0,
  };

  bot.on("inline_query", async (telegramCtx) => {
    if (telegramCtx.from == null) return null;
    const { query } = telegramCtx.inlineQuery;

    let polls: Poll[] = [];
    if (query) {
      const poll = await convexCtx.runQuery(api.poll.get, {
        id: query as Id<"poll">,
      });
      if (poll) {
        const { id, first_name, last_name, username } = telegramCtx.from;
        const { user } = await convexCtx.runMutation(api.telegram.user.upsert, {
          telegramUserDetails: {
            telegramUserId: id,
            first_name,
            last_name,
            username,
          },
        });
        await convexCtx.runMutation(api.telegram.poll.claim, {
          pollId: poll._id,
          creatorId: user._id,
        });
        polls = [poll];
      }
    } else {
      polls = await convexCtx.runQuery(api.telegram.poll.listForUser, {
        telegramUserId: telegramCtx.from.id,
      });
    }

    return telegramCtx.answerInlineQuery(
      polls.map(pollToAnswer),
      answerInlineQueryOptions,
    );
  });

  bot.on("chosen_inline_result", async (ctx) => {
    const { result_id, inline_message_id } = ctx.chosenInlineResult;
    if (!(result_id && inline_message_id)) return;

    const poll = await convexCtx.runQuery(api.poll.get, {
      id: result_id as Id<"poll">,
    });
    if (!poll) return;

    const messageText = await makePollMessage(convexCtx, poll);
    await bot.api.editMessageTextInline(inline_message_id, messageText, {
      parse_mode: "MarkdownV2",
    });

    await convexCtx.runMutation(api.telegram.poll.addInlineMessage, {
      pollId: poll._id,
      inlineMessageId: inline_message_id,
      messageText,
    });
  });

  bot.catch((error) => {
    console.error(error);
  });

  return bot;
}
