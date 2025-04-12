import { getAuthUserId } from "@convex-dev/auth/server";
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { api } from "./_generated/api";
import { DataModel, Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import {
  getUserId as telegramGetUserId,
  resolveUserId as telegramResolveUserId,
} from "./telegram/user";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId !== null ? ctx.db.get(userId) : null;
  },
}); // Mutations can use this to get the telegram user's userId regardless of whether they're already in the database

export async function resolveUserId(
  ctx: GenericMutationCtx<DataModel>,
  initData?: string,
) {
  if (initData) {
    return await telegramResolveUserId(ctx, initData);
  } else {
    const user = (await ctx.runQuery(api.user.viewer)) as Doc<"users">;
    return user?._id;
  }
}

export async function getUserId(
  ctx: GenericQueryCtx<DataModel>,
  initData?: string,
) {
  console.log("getUserId", initData);
  if (initData) {
    return await telegramGetUserId(ctx, initData);
  } else {
    const user = (await ctx.runQuery(api.user.viewer)) as Doc<"users">;
    return user?._id;
  }
}
