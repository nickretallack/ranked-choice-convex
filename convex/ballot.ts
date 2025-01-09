import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const save = mutation({
  args: {
    pollId: v.id("poll"),
    ranking: v.array(v.id("candidate")),
  },
  handler: async (ctx, { pollId, ranking }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    console.log("identity", identity);
    // const userId = identity.subject;
    // return await ctx.db.insert("ballot", {
    //   pollId,
    //   ranking,
    //   userId: identity.subject,
    // });
  },
});
