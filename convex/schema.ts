import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
  poll: defineTable({
    title: v.string(),
    creatorId: v.optional(v.id("user")),
    allowNominations: v.boolean(),
  }).index("by_creatorId", ["creatorId"]),
  candidate: defineTable({
    name: v.string(),
    pollId: v.id("poll"),
    creatorId: v.optional(v.id("user")),
  }).index("by_pollId", ["pollId"]),
  telegramInlineMessage: defineTable({
    pollId: v.id("poll"),
    inlineMessageId: v.string(),
    messageText: v.string(),
  }),
  telegramUser: defineTable({
    userId: v.id("user"),
    telegramUserId: v.number(),
    username: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    photo_url: v.optional(v.string()),
  })
    .index("by_telegramUserId", ["telegramUserId"])
    .index("by_userId", ["userId"]),
  user: defineTable({
    clerkUserId: v.optional(v.string()),
  }),
});
