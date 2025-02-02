"use node";

import { convexAuth } from "@convex-dev/auth/server";
import { TelegramProvider } from "./telegram/auth";
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [TelegramProvider],
});
