import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const upsert = mutation({
  args: {
    user: v.object({
      id: v.number(),
      username: v.optional(v.string()),
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      photo_url: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { user }) => {
    console.log("RUNNING THE QUERY", user);
    const { id: telegramUserId, ...rest } = user;

    const existingUser = await ctx.db
      .query("telegramUser")
      .withIndex("by_telegramUserId", (q) =>
        q.eq("telegramUserId", telegramUserId),
      )
      .unique();

    if (existingUser) {
      console.log("EXISTING USER", existingUser);
      if (
        existingUser.username !== rest.username ||
        existingUser.first_name !== rest.first_name ||
        existingUser.last_name !== rest.last_name ||
        existingUser.photo_url !== rest.photo_url
      ) {
        console.log("UPDATING USER", rest);
        await ctx.db.patch(existingUser._id, rest);
      }

      return existingUser.userId;
    }

    const userId = await ctx.db.insert("user", {});

    await ctx.db.insert("telegramUser", {
      userId,
      telegramUserId,
      ...rest,
    });

    return userId;
  },
});
