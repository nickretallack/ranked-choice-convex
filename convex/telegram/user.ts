import type { WebAppUser } from "@twa-dev/types";
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { DataModel, Doc } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { telegramUserDetailsFields } from "../schema";

export const upsert = mutation({
  args: {
    telegramUserDetails: v.object(telegramUserDetailsFields),
  },
  handler: async (ctx, { telegramUserDetails }) => {
    const { telegramUserId, ...rest } = telegramUserDetails;
    const telegramUser = await getTelegramUser(ctx, telegramUserId);

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
    const userId = await ctx.db.insert("users", {});
    const user = (await ctx.db.get(userId))!;
    await ctx.db.insert("telegramUser", {
      userId,
      telegramUserId,
      ...rest,
    });

    return { user, changed: false, created: true };
  },
});

export const getByInitData = query({
  args: {
    initData: v.string(),
  },
  handler: async (ctx, { initData }) => {
    const telegramUserDetails = await validateInitData(initData);
    return await getTelegramUser(ctx, telegramUserDetails.telegramUserId);
  },
});

export const getByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("telegramUser")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

function getTelegramUser(
  ctx: GenericQueryCtx<DataModel>,
  telegramUserId: number,
) {
  return ctx.db
    .query("telegramUser")
    .withIndex("by_telegramUserId", (q) =>
      q.eq("telegramUserId", telegramUserId),
    )
    .unique();
}

// Queries can use this to get the telegram user's userId if they're already in the database
export async function getUserId(
  ctx: GenericQueryCtx<DataModel>,
  initData: string,
) {
  const telegramUserDetails = await validateInitData(initData);
  const telegramUser = await getTelegramUser(
    ctx,
    telegramUserDetails.telegramUserId,
  );
  if (telegramUser) {
    return telegramUser.userId;
  }
  return null;
}

// Mutations can use this to get the telegram user's userId regardless of whether they're already in the database
export async function resolveUserId(
  ctx: GenericMutationCtx<DataModel>,
  initData: string,
) {
  const telegramUserDetails = await validateInitData(initData);
  const { user } = (await ctx.runMutation(api.telegram.user.upsert, {
    telegramUserDetails,
  })) as { user: Doc<"users"> };
  return user._id;
}

export async function validateInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const isValid = await validateWebAppData(
    process.env.TELEGRAM_BOT_SECRET!,
    params,
  );
  if (!isValid) {
    throw new Error("Invalid telegram user details.");
  }
  const telegramUserDetails = JSON.parse(params.get("user")!) as WebAppUser;
  if (telegramUserDetails.is_bot) {
    throw new Error("Bot accounts are not allowed");
  }

  const {
    id: telegramUserId,
    first_name,
    last_name,
    username,
    photo_url,
  } = telegramUserDetails;
  return { telegramUserId, first_name, last_name, username, photo_url };
}

// This is an AI-generated conversion of @grammyjs/validator to SubtleCrypto.
export async function validateWebAppData(
  botToken: string,
  data: URLSearchParams,
) {
  const checkString = Array.from(data.entries())
    .filter(([key]) => key !== "hash")
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  // First HMAC
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secretKey = await crypto.subtle.sign(
    "HMAC",
    keyMaterial,
    encoder.encode(botToken),
  );

  // Second HMAC
  const finalKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    finalKey,
    encoder.encode(checkString),
  );

  // Convert to hex
  const hash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hash === data.get("hash");
}
