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
import type * as ballot from "../ballot.js";
import type * as candidate from "../candidate.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as poll from "../poll.js";
import type * as telegram_actions from "../telegram/actions.js";
import type * as telegram_bot from "../telegram/bot.js";
import type * as telegram_openid from "../telegram/openid.js";
import type * as telegram_poll from "../telegram/poll.js";
import type * as telegram_user from "../telegram/user.js";
import type * as telegram_webhook from "../telegram/webhook.js";
import type * as userHelpers from "../userHelpers.js";
import type * as util_normalizeWhitespace from "../util/normalizeWhitespace.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ballot: typeof ballot;
  candidate: typeof candidate;
  http: typeof http;
  messages: typeof messages;
  poll: typeof poll;
  "telegram/actions": typeof telegram_actions;
  "telegram/bot": typeof telegram_bot;
  "telegram/openid": typeof telegram_openid;
  "telegram/poll": typeof telegram_poll;
  "telegram/user": typeof telegram_user;
  "telegram/webhook": typeof telegram_webhook;
  userHelpers: typeof userHelpers;
  "util/normalizeWhitespace": typeof util_normalizeWhitespace;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
