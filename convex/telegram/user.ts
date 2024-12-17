import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { telegramUserDetailsFields } from "../schema";

export const upsert = mutation({
  args: {
    telegramUserDetails: v.object(telegramUserDetailsFields),
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
