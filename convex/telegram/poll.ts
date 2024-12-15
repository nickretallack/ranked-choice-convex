import { v } from "convex/values";
import { mutation } from "../_generated/server";

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

export const claim = mutation({
  args: {
    pollId: v.id("poll"),
    userId: v.id("user"),
  },
  handler: async (ctx, { pollId, userId }) => {
    await ctx.db.patch(pollId, {
      userId,
    });
  },
});
