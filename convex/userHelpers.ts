import { Auth } from "convex/server";
import { Id } from "./_generated/dataModel";
import type { ClerkPublicMetadata } from "./shared/userType";

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
    throw new Error("Who are you?");
  }
  return {
    id: identity.externalId as Id<"user">,
    publicMetadata: identity.publicMetadata as ClerkPublicMetadata,
  };
}
