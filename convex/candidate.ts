import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalizeWhitespace } from "./shared/normalizeWhitespace";
import { requireUserId } from "./user";

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
    const userId = await requireUserId(ctx);

    const strippedName = normalizeWhitespace(name);
    if (!strippedName) throw new Error("Name cannot be empty");
    const normalizedName = strippedName.toLowerCase();

    const poll = await ctx.db.get(pollId);
    if (!poll) throw new Error("Poll not found");
    if (!poll.allowNominations)
      throw new Error("Nominations are not allowed for this poll");
    if (poll.closed) throw new Error("Poll is closed");

    const existingCandidate = await ctx.db
      .query("candidate")
      .withIndex("by_pollId_normalizedName", (q) =>
        q.eq("pollId", pollId).eq("normalizedName", normalizedName),
      )
      .first();
    if (existingCandidate) return existingCandidate._id;

    return await ctx.db.insert("candidate", {
      pollId,
      name: strippedName,
      normalizedName,
      creatorId: userId,
    });
  },
});
