import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import type { WebAppUser } from "@twa-dev/types";
import { api } from "../_generated/api";
import { Doc } from "../_generated/dataModel";

export const TelegramProvider = ConvexCredentials({
  id: "telegram",
  authorize: async (credentials, ctx) => {
    const telegramUserDetails = await validateInitData(
      credentials.initData as string,
    );
    const { user } = (await ctx.runMutation(api.telegram.user.upsert, {
      telegramUserDetails,
    })) as { user: Doc<"users">; changed: boolean; created: boolean };
    return { userId: user._id };
  },
});

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
