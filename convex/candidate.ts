import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: { pollId: v.id("poll") },
  handler: async (ctx, { pollId }) => {
    return await ctx.db
      .query("candidate")
      .withIndex("by_pollId", (q) => q.eq("pollId", pollId))
      .collect();
  },
});
