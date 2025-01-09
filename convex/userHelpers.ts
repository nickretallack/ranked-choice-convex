import { Auth } from "convex/server";
import { Id } from "./_generated/dataModel";

export type ClerkPublicMetadata = {
  telegramUserId: number;
  telegramUsername: string;
  telegramPhotoUrl: string;
  telegramFirstName: string;
  telegramLastName: string;
};

export type ClerkUser = {
  publicMetadata: ClerkPublicMetadata;
  externalId: string;
  firstName: string;
  lastName: string;
  username: string;
};

export async function requireUser(ctx: { auth: Auth }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return {
    id: identity.externalId as Id<"user">,
    publicMetadata: identity.publicMetadata as ClerkPublicMetadata,
  };
}
