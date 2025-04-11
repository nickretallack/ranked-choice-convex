import { DiscordProfile } from "@auth/core/providers/discord";
import { TokenSet } from "@auth/core/types";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { DiscordProvider } from "../auth";
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

export const get = query({
  args: {
    discordUserId: v.string(),
  },
  handler: async (ctx, { discordUserId }): Promise<Id<"users"> | undefined> => {
    const existingAccount = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "discord").eq("providerAccountId", discordUserId),
      )
      .first();

    return existingAccount?.userId;
  },
});

export const upsert = mutation({
  args: {
    discordMember,
  },
  handler: async (ctx, { discordMember }): Promise<Id<"users">> => {
    const existingUserId = await ctx.runQuery(api.discord.user.get, {
      discordUserId: discordMember.user.id,
    });

    if (existingUserId) return existingUserId;

    // Create new user
    const profile = (await DiscordProvider.profile!(
      discordMember.user as DiscordProfile,
      undefined as unknown as TokenSet, // TokenSet not used;
    )) as Partial<Doc<"users">>; // slight inconsequential type mismatch: name can be null

    const userId = await ctx.db.insert("users", profile);

    // Create auth account
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "discord",
      providerAccountId: discordMember.user.id,
    });
    

    return userId;
  },
});
