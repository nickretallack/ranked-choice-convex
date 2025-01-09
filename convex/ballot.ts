import { v } from "convex/values";
import { mutation } from "./_generated/server";
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
