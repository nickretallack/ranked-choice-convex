import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { updateInlineMessages } from "./bot";

export const pollChanged = action({
  args: {
    pollId: v.id("poll"),
  },
  handler: async (ctx, { pollId }) => {
    await updateInlineMessages(ctx, pollId);
  },
});

export const list = query({
  args: {
    pollId: v.id("poll"),
  },
  handler: async (ctx, { pollId }) => {
    return await ctx.db
      .query("telegramInlineMessage")
      .filter((q) => q.eq(q.field("pollId"), pollId))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("telegramInlineMessage"),
    messageText: v.string(),
  },
  handler: async (ctx, { id, messageText }) => {
    await ctx.db.patch(id, { messageText });
  },
});
