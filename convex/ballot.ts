import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./userHelpers";

export const save = mutation({
  args: {
    pollId: v.id("poll"),
    ranking: v.array(v.id("candidate")),
  },
  handler: async (ctx, { pollId, ranking }) => {
    const userId = (await requireUser(ctx)).id;
    console.log("userId", userId);
    return await ctx.db.insert("ballot", {
      pollId,
      userId,
      ranking,
    });
  },
});

export const get = query({
  args: {
    pollId: v.id("poll"),
  },
  handler: async (ctx, { pollId }) => {
    const userId = (await requireUser(ctx)).id;
    const ballot = await ctx.db
      .query("ballot")
      .withIndex("by_userId_pollId", (q) =>
        q.eq("userId", userId).eq("pollId", pollId),
      )
      .unique();
    return ballot?.ranking || [];
  },
});
