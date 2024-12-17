"use node";

import { validateWebAppData } from "@grammyjs/validator";
import { v } from "convex/values";
import { action } from "../_generated/server";
import type { WebAppUser } from "@twa-dev/types";
import { api } from "../_generated/api";
import { SignJWT, importPKCS8 } from "jose";

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

    const pem = process.env.JWT_SIGNING_KEY!.replace(/ /g, "\n");
    const key = await importPKCS8(pem, "RS256");

    return await new SignJWT({
      sub: userId,
      iss: "https://witty-slug-31.clerk.accounts.dev",
      // iat: Math.floor(Date.now() / 1000),
      aud: "convex",
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      name: `${first_name} ${last_name}`,
      picture: photo_url,
      preferred_username: username,
      given_name: first_name,
      family_name: last_name,
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuedAt()
      .sign(key);
  },
});
