import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { trimList } from "../util/normalizeWhitespace";

export const create = mutation({
  args: {
    title: v.string(),
    candidates: v.array(v.string()),
    allowNominations: v.boolean(),
    liveResults: v.boolean(),
  },
  handler: async (
    ctx,
    { title, candidates, allowNominations, liveResults },
  ) => {
    const pollId = await ctx.db.insert("poll", {
      title,
      allowNominations,
      liveResults,
      closed: false,
    });
    await Promise.all(
      trimList(candidates).map((candidate) =>
        ctx.db.insert("candidate", {
          name: candidate,
          pollId,
        }),
      ),
    );
    return pollId;
  },
});

export const claim = mutation({
  args: {
    pollId: v.id("poll"),
    creatorId: v.id("user"),
  },
  handler: async (ctx, { pollId, creatorId }) => {
    await ctx.db.patch(pollId, {
      creatorId,
    });

    // Find all candidates for this poll that don't have a userId
    const candidates = await ctx.db
      .query("candidate")
      .withIndex("by_pollId", (q) => q.eq("pollId", pollId))
      .filter((q) => q.eq(q.field("creatorId"), undefined))
      .collect();

    // claim them
    await Promise.all(
      candidates.map((candidate) =>
        ctx.db.patch(candidate._id, {
          creatorId,
        }),
      ),
    );
  },
});

export const addInlineMessage = mutation({
  args: {
    pollId: v.id("poll"),
    inlineMessageId: v.string(),
    messageText: v.string(),
  },
  handler: async (ctx, { pollId, inlineMessageId, messageText }) => {
    return await ctx.db.insert("telegramInlineMessage", {
      pollId,
      inlineMessageId,
      messageText,
    });
  },
});

export const listForUser = query({
  args: { telegramUserId: v.number() },
  handler: async (ctx, { telegramUserId }) => {
    const creator = await ctx.db
      .query("telegramUser")
      .withIndex("by_telegramUserId", (q) =>
        q.eq("telegramUserId", telegramUserId),
      )
      .unique();
    if (creator == null) return [];

    return await ctx.db
      .query("poll")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator.userId))
      .collect();
  },
});

export const listTelegramPollIds = query({
  handler: async (ctx) => {
    // efficient implementation of DISTINCT pollId
    const pollIds = [];
    let message = await ctx.db
      .query("telegramInlineMessage")
      .withIndex("by_pollId")
      .order("desc")
      .first();
    while (message != null) {
      const pollId = message.pollId;
      pollIds.push(pollId);
      message = await ctx.db
        .query("telegramInlineMessage")
        .withIndex("by_pollId", (q) => q.lt("pollId", pollId))
        .order("desc")
        .first();
    }
    return pollIds;
  },
});
