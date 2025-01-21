import { v } from "convex/values";
import { query } from "./_generated/server";
import { PollResults, tallyResults } from "./tally";

export const get = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getResults = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }): Promise<PollResults> => {
    const poll = await ctx.db.get(id);
    if (!poll) throw new Error("Poll not found");

    // TODO: check for disqalified candidates?

    const ballots = await ctx.db
      .query("ballot")
      .withIndex("by_pollId", (q) => q.eq("pollId", id))
      .collect();

    return tallyResults(ballots);
  },
});
