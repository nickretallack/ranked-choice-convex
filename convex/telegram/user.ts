import { v } from "convex/values";
import { mutation } from "../_generated/server";

const telegramUserDetailsSpec = v.object({
  telegramUserId: v.number(),
  username: v.optional(v.string()),
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  photo_url: v.optional(v.string()),
});

// TODO: remove this
export const upsert = mutation({
  args: {
    telegramUserDetails: telegramUserDetailsSpec,
  },
  handler: async (ctx, { telegramUserDetails }) => {
    const { telegramUserId, ...rest } = telegramUserDetails;

    const telegramUser = await ctx.db
      .query("telegramUser")
      .withIndex("by_telegramUserId", (q) =>
        q.eq("telegramUserId", telegramUserId),
      )
      .unique();

    if (telegramUser) {
      // Update cached telegram details
      const changed =
        telegramUser.username !== rest.username ||
        telegramUser.first_name !== rest.first_name ||
        telegramUser.last_name !== rest.last_name ||
        telegramUser.photo_url !== rest.photo_url;
      if (changed) {
        await ctx.db.patch(telegramUser._id, rest);
      }

      // Return existing user
      const user = (await ctx.db.get(telegramUser.userId))!;
      return { user, changed, created: false };
    }

    // Create a new user
    const userId = await ctx.db.insert("user", {});
    const user = (await ctx.db.get(userId))!;
    await ctx.db.insert("telegramUser", {
      userId,
      telegramUserId,
      ...rest,
    });

    return { user, changed: false, created: true };
  },
});

export const setClerkUserId = mutation({
  args: {
    userId: v.id("user"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, { userId, clerkUserId }) => {
    await ctx.db.patch(userId, { clerkUserId });
  },
});
