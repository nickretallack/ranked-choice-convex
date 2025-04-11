import Discord from "@auth/core/providers/discord";
import { convexAuth } from "@convex-dev/auth/server";

export const DiscordProvider = Discord({
  clientId: process.env.DISCORD_APPLICATION_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [DiscordProvider],
});
