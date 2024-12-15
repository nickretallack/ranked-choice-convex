"use node";

import { validateWebAppData } from "@grammyjs/validator";
import { v } from "convex/values";
import { action } from "../_generated/server";

export const validateUser = action({
  args: {
    initData: v.string(),
  },
  handler: async (ctx, { initData }) => {
    // TODO: error handling?
    const params = new URLSearchParams(initData);
    return validateWebAppData(process.env.TELEGRAM_BOT_SECRET!, params);
  },
});
