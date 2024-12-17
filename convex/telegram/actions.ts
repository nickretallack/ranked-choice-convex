"use node";

import { validateWebAppData } from "@grammyjs/validator";
import { v } from "convex/values";
import { action } from "../_generated/server";
import type { WebAppUser } from "@twa-dev/types";
import { api } from "../_generated/api";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

function validateInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const isValid = validateWebAppData(process.env.TELEGRAM_BOT_SECRET!, params);
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

export const validateUser = action({
  args: {
    initData: v.string(),
  },
  handler: async (ctx, { initData }) => {
    // Validate Telegram initData
    const telegramUserDetails = validateInitData(initData);

    // Upsert the Telegram user in our database
    const { user } = await ctx.runMutation(api.telegram.user.upsert, {
      telegramUserDetails,
    });

    // Create a Clerk user if we don't have one
    let clerkUserId: string;
    if (user.clerkUserId) {
      clerkUserId = user.clerkUserId;
    } else {
      const clerkUser = await clerkClient.users.createUser({
        username: `user:${user._id}`,
        externalId: user._id,
        firstName: telegramUserDetails.first_name,
        lastName: telegramUserDetails.last_name,
        publicMetadata: {
          telegramUserId: telegramUserDetails.telegramUserId,
          telegramUsername: telegramUserDetails.username,
          telegramPhotoUrl: telegramUserDetails.photo_url,
          telegramFirstName: telegramUserDetails.first_name,
          telegramLastName: telegramUserDetails.last_name,
        },
      });

      // Set the Clerk user id in our database
      await ctx.runMutation(api.telegram.user.setClerkUserId, {
        userId: user._id,
        clerkUserId: clerkUser.id,
      });
      clerkUserId = clerkUser.id;
    }

    // Return a sign in token for the Clerk user
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUserId,
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    return signInToken.token;
  },
});
