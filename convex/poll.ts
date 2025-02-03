import { GenericMutationCtx } from "convex/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { PollResults, tallyResults } from "./tally";
import { requireUserId } from "./user";

export const get = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const updateSettings = mutation({
  args: {
    id: v.id("poll"),
    title: v.string(),
    allowNominations: v.boolean(),
    liveResults: v.boolean(),
  },
  handler: async (ctx, { id, title, allowNominations, liveResults }) => {
    await requirePollOwner(ctx, id);
    return await ctx.db.patch(id, { title, allowNominations, liveResults });
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
    const { poll } = await requirePollOwner(ctx, id);
    await ctx.db.patch(id, { closed: true });

    if (!poll.liveResults) {
      await ctx.scheduler.runAfter(0, api.telegram.inlineMessages.pollChanged, {
        pollId: id,
      });
    }
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
  const userId = await requireUserId(ctx);

  const poll = await ctx.db.get(id);
  if (!poll) throw new Error("Poll not found");
  if (poll.creatorId !== userId)
    throw new Error("You are not the owner of this poll.");
  return { poll, userId };
}
