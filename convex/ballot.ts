import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { getUserId, resolveUserId } from "./telegram/user";

export const save = mutation({
  args: {
    pollId: v.id("poll"),
    ranking: v.array(v.id("candidate")),
    telegramInitData: v.string(),
  },
  handler: async (ctx, { pollId, ranking, telegramInitData }) => {
    const userId = await resolveUserId(telegramInitData, ctx);

    const poll = await ctx.db.get(pollId);
    if (!poll) throw new Error("Poll not found");
    if (poll.closed) throw new Error("Poll is closed");

    const ballot = await ctx.db
      .query("ballot")
      .withIndex("by_userId_pollId", (q) =>
        q.eq("userId", userId).eq("pollId", pollId),
      )
      .unique();

    if (ballot) {
      await ctx.db.patch(ballot._id, {
        ranking,
      });
    } else {
      await ctx.db.insert("ballot", {
        pollId,
        userId,
        ranking,
      });
    }

    // Report live results in Telegram if enabled
    if (poll.liveResults) {
      const inlineMessages = await ctx.db
        .query("telegramInlineMessage")
        .withIndex("by_pollId", (q) => q.eq("pollId", pollId))
        .collect();
      if (inlineMessages.length > 0) {
        await ctx.scheduler.runAfter(
          0,
          api.telegram.inlineMessages.pollChanged,
          {
            pollId,
          },
        );
      }
    }
  },
});

export const get = query({
  args: {
    pollId: v.id("poll"),
    telegramInitData: v.string(),
  },
  handler: async (ctx, { pollId, telegramInitData }) => {
    const userId = await getUserId(telegramInitData, ctx);
    if (!userId) return [];
    const ballot = await ctx.db
      .query("ballot")
      .withIndex("by_userId_pollId", (q) =>
        q.eq("userId", userId).eq("pollId", pollId),
      )
      .unique();
    return ballot?.ranking || [];
  },
});
