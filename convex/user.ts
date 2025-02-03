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

export async function getUserId(ctx: { auth: Auth }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const subjectParts = identity.subject.split("|");
  return subjectParts[0] as Id<"users">;
}

export async function requireUserId(ctx: { auth: Auth }) {
  const userId = await getUserId(ctx);
  if (!userId) {
    throw new Error("Who are you?");
  }
  return userId;
}
