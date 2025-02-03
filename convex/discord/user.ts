import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

export const discordUser = v.object({
  id: v.string(),
  username: v.string(),
  discriminator: v.string(),
  avatar: v.optional(v.string()),
  bot: v.optional(v.boolean()),
  global_name: v.optional(v.string()),
});

export const discordMember = v.object({
  user: discordUser,
  nick: v.optional(v.string()),
  avatar: v.optional(v.string()),
  roles: v.array(v.string()),
  joined_at: v.string(),
  premium_since: v.optional(v.string()),
  deaf: v.boolean(),
  mute: v.boolean(),
  pending: v.optional(v.boolean()),
  permissions: v.optional(v.string()),
  communication_disabled_until: v.optional(v.string()),
});

export const upsert = mutation({
  args: {
    discordMember,
  },
  handler: async (ctx, { discordMember }): Promise<Id<"users">> => {
    const discordUser = await ctx.db
      .query("discordUser")
      .filter((q) => q.eq(q.field("discordUserId"), discordMember.user.id))
      .first();
    if (discordUser) {
      // TODO: patch changes
      return discordUser.userId;
    }

    const userId = await ctx.db.insert("users", {});
    await ctx.db.insert("discordUser", {
      discordUserId: discordMember.user.id,
      userId,
    });
    return userId;
  },
});
