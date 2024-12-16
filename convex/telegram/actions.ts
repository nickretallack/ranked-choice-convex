"use node";

import { validateWebAppData } from "@grammyjs/validator";
import { v } from "convex/values";
import { action } from "../_generated/server";
import type { WebAppUser } from "@twa-dev/types";
import { api } from "../_generated/api";
import { SignJWT } from "jose";

export const validateUser = action({
  args: {
    initData: v.string(),
  },
  handler: async (ctx, { initData }) => {
    // TODO: error handling?
    const params = new URLSearchParams(initData);
    const isValid = validateWebAppData(
      process.env.TELEGRAM_BOT_SECRET!,
      params,
    );
    if (!isValid) {
      throw new Error("Invalid telegram user details.");
    }
    const user = JSON.parse(params.get("user")!) as WebAppUser;
    if (user.is_bot) {
      throw new Error("Bot accounts are not allowed");
    }

    const { id, first_name, last_name, username, photo_url } = user;
    const userId = (await ctx.runMutation(api.telegram.user.upsert, {
      user: { id, first_name, last_name, username, photo_url },
    })) as string;

    return await new SignJWT({
      sub: userId,
      aud: "convex",
      name: `${first_name} ${last_name}`,
      picture: photo_url,
      nickname: username,
      given_name: first_name,
      family_name: last_name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(new TextEncoder().encode(process.env.TELEGRAM_BOT_SECRET));
  },
});
