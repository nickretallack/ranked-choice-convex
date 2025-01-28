import { UniqueIdentifier } from "@dnd-kit/core";
import { Doc } from "../_generated/dataModel";

export function indexByUniqueIdentifier(items: Doc<"candidate">[]) {
  const result = new Map<UniqueIdentifier, Doc<"candidate">>();
  for (const item of items) {
    result.set(item._id, item);
  }
  return result;
}
