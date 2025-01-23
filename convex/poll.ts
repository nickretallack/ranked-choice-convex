import { GenericMutationCtx } from "convex/server";
import { v } from "convex/values";
import { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { PollResults, tallyResults } from "./tally";
import { requireUser } from "./userHelpers";

export const get = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const updateSettings = mutation({
  args: { id: v.id("poll"), title: v.string(), allowNominations: v.boolean() },
  handler: async (ctx, { id, title, allowNominations }) => {
    await requirePollOwner(ctx, id);
    return await ctx.db.patch(id, { title, allowNominations });
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

export const close = mutation({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    await requirePollOwner(ctx, id);
    return await ctx.db.patch(id, { closed: true });
  },
});

export const reopen = mutation({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    await requirePollOwner(ctx, id);
    return await ctx.db.patch(id, { closed: false });
  },
});

async function requirePollOwner(
  ctx: GenericMutationCtx<DataModel>,
  id: Id<"poll">,
) {
  const userId = (await requireUser(ctx)).id;

  const poll = await ctx.db.get(id);
  if (!poll) throw new Error("Poll not found");
  if (poll.creatorId !== userId)
    throw new Error("You are not the owner of this poll.");
}
