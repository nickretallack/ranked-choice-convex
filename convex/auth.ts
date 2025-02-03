import { convexAuth } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { TelegramProvider } from "./telegram/auth";
import { getUserId } from "./user";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [TelegramProvider],
});

export const getCurrentUserId = query({
  args: {},
  handler: getUserId,
});
