import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    return await ctx.db.insert("poll", { title });
  },
});

export const get = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
