import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    return await ctx.db.insert("poll", { title });
  },
});
