"use node";

import { AuthProviderConfig } from "@convex-dev/auth/server";
import { validateWebAppData } from "@grammyjs/validator";
import type { WebAppUser } from "@twa-dev/types";
import { api } from "../_generated/api";

export const TelegramProvider: AuthProviderConfig = {
  id: "telegram",
  type: "credentials",
  authorize: async (params, ctx) => {
    const telegramUserDetails = validateInitData(params.initData as string);

    const { user } = await ctx.runMutation(api.telegram.user.upsert, {
      telegramUserDetails,
    });
    return { userId: user._id };
  },
};

export function validateInitData(initData: string) {
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
