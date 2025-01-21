import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./userHelpers";
import { normalizeWhitespace } from "./util/normalizeWhitespace";

export const list = query({
  args: { pollId: v.id("poll") },
  handler: async (ctx, { pollId }) => {
    return await ctx.db
      .query("candidate")
      .withIndex("by_pollId", (q) => q.eq("pollId", pollId))
      .collect();
  },
});

export const nominate = mutation({
  args: { pollId: v.id("poll"), name: v.string() },
  handler: async (ctx, { pollId, name }) => {
    const userId = (await requireUser(ctx)).id;

    const normalizedName = normalizeWhitespace(name);
    if (!normalizedName) throw new Error("Name cannot be empty");

    const poll = await ctx.db.get(pollId);
    if (!poll) throw new Error("Poll not found");

    const existingCandidate = await ctx.db
      .query("candidate")
      .withIndex("by_pollId", (q) => q.eq("pollId", pollId))
      .filter((q) => q.eq(q.field("name"), normalizedName))
      .first();
    if (existingCandidate) return existingCandidate._id;

    return await ctx.db.insert("candidate", {
      pollId,
      name: normalizedName,
      creatorId: userId,
    });
  },
});
