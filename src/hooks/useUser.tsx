import { useUser as clerkUseUser } from "@clerk/clerk-react";
import { Id } from "@convex/_generated/dataModel";
import type { ClerkPublicMetadata } from "@convex/util/userType";

export default function useUser() {
  const { user } = clerkUseUser();
  return {
    id: user?.externalId as Id<"user">,
    publicMetadata: user?.publicMetadata as ClerkPublicMetadata,
  };
}
