import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { trimList } from "../shared/normalizeWhitespace";
import { discordMember } from "./user";

// todo: mark as internal
export const create = mutation({
  args: {
    title: v.string(),
    liveResults: v.boolean(),
    allowNominations: v.boolean(),
    candidates: v.array(v.string()),
    discordMember: discordMember,
  },
  handler: async (
    ctx,
    { title, liveResults, allowNominations, candidates, discordMember },
  ) => {
    const creatorId = (await ctx.runMutation(api.discord.user.upsert, {
      discordMember,
    })) as Id<"users">;

    const pollId = await ctx.db.insert("poll", {
      title,
      allowNominations,
      liveResults,
      closed: false,
      creatorId,
    });
    await Promise.all(
      trimList(candidates).map((candidate) =>
        ctx.db.insert("candidate", {
          name: candidate,
          normalizedName: candidate.toLowerCase(),
          pollId,
          creatorId,
        }),
      ),
    );
    return (await ctx.db.get(pollId))!;
  },
});
