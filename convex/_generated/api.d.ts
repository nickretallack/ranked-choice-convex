/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bot from "../bot.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as polls from "../polls.js";
import type * as telegram from "../telegram.js";
import type * as telegramWebhook from "../telegramWebhook.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bot: typeof bot;
  http: typeof http;
  messages: typeof messages;
  polls: typeof polls;
  telegram: typeof telegram;
  telegramWebhook: typeof telegramWebhook;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
