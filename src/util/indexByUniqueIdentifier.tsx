import { Doc } from "@convex/_generated/dataModel";
import { UniqueIdentifier } from "@dnd-kit/core";

export function indexByUniqueIdentifier(items: Doc<"candidate">[]) {
  const result = new Map<UniqueIdentifier, Doc<"candidate">>();
  for (const item of items) {
    result.set(item._id, item);
  }
  return result;
}
