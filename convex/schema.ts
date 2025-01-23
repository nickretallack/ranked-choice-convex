import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.

export const telegramUserDetailsFields = {
  telegramUserId: v.number(),
  username: v.optional(v.string()),
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  photo_url: v.optional(v.string()),
};

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
  poll: defineTable({
    title: v.string(),
    creatorId: v.optional(v.id("user")),
    allowNominations: v.boolean(),
    closed: v.boolean(),
    liveResults: v.boolean(),
  }).index("by_creatorId", ["creatorId"]),
  candidate: defineTable({
    name: v.string(),
    pollId: v.id("poll"),
    creatorId: v.optional(v.id("user")),
  }).index("by_pollId", ["pollId"]),
  ballot: defineTable({
    userId: v.id("user"),
    pollId: v.id("poll"),
    ranking: v.array(v.id("candidate")),
  })
    .index("by_userId_pollId", ["userId", "pollId"])
    .index("by_pollId", ["pollId"]),
  results: defineTable({
    pollId: v.id("poll"),
    candidates: v.record(v.id("candidate"), v.array(v.number())),
    eliminations: v.array(
      v.object({
        candidateId: v.id("candidate"),
        round: v.number(),
      }),
    ),
  }),
  telegramInlineMessage: defineTable({
    pollId: v.id("poll"),
    inlineMessageId: v.string(),
    messageText: v.string(),
  }).index("by_pollId", ["pollId"]),
  telegramUser: defineTable({
    userId: v.id("user"),
    ...telegramUserDetailsFields,
  })
    .index("by_telegramUserId", ["telegramUserId"])
    .index("by_userId", ["userId"]),
  user: defineTable({
    clerkUserId: v.optional(v.string()),
  }),
});
