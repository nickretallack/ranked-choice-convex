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
// export const upsert = mutation({
//   args: {
//     user: v.object({
//       id: v.number(),
//       username: v.optional(v.string()),
//       first_name: v.optional(v.string()),
//       last_name: v.optional(v.string()),
//       photo_url: v.optional(v.string()),
//     }),
//   },
//   handler: async (ctx, { user }) => {
//     const { id: telegramUserId, ...rest } = user;

//     const existingTelegramUser = await ctx.db
//       .query("telegramUser")
//       .withIndex("by_telegramUserId", (q) =>
//         q.eq("telegramUserId", telegramUserId),
//       )
//       .unique();

//     if (existingTelegramUser) {
//       if (
//         existingTelegramUser.username !== rest.username ||
//         existingTelegramUser.first_name !== rest.first_name ||
//         existingTelegramUser.last_name !== rest.last_name ||
//         existingTelegramUser.photo_url !== rest.photo_url
//       ) {
//         await ctx.db.patch(existingTelegramUser._id, rest);
//       }

//       return { userId: existingTelegramUser.userId, created: false };
//     }

//     const userId = await ctx.db.insert("user", {});

//     await ctx.db.insert("telegramUser", {
//       userId,
//       telegramUserId,
//       ...rest,
//     });

//     return { userId, created: true };
//   },
// });

export const create = mutation({
  args: {
    clerkUserId: v.string(),
    telegramUserDetails: telegramUserDetailsSpec,
  },
  handler: async (ctx, { clerkUserId, telegramUserDetails }) => {
    const userId = await ctx.db.insert("user", { clerkUserId });
    await ctx.db.insert("telegramUser", {
      userId,
      ...telegramUserDetails,
    });
    return userId;
  },
});

export const getAndUpdate = mutation({
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
      const changed =
        telegramUser.username !== rest.username ||
        telegramUser.first_name !== rest.first_name ||
        telegramUser.last_name !== rest.last_name ||
        telegramUser.photo_url !== rest.photo_url;
      if (changed) {
        await ctx.db.patch(telegramUser._id, rest);
      }

      const user = await ctx.db.get(telegramUser.userId);
      if (!user) {
        throw new Error("User not found");
      }
      return { telegramUser, user, changed };
    }
    return null;
  },
});
