/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ballot from "../ballot.js";
import type * as candidate from "../candidate.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as poll from "../poll.js";
import type * as shared_indexByUniqueIdentifier from "../shared/indexByUniqueIdentifier.js";
import type * as shared_normalizeWhitespace from "../shared/normalizeWhitespace.js";
import type * as shared_recordIncrement from "../shared/recordIncrement.js";
import type * as shared_userType from "../shared/userType.js";
import type * as tally from "../tally.js";
import type * as telegram_bot from "../telegram/bot.js";
import type * as telegram_inlineMessages from "../telegram/inlineMessages.js";
import type * as telegram_openid from "../telegram/openid.js";
import type * as telegram_poll from "../telegram/poll.js";
import type * as telegram_user from "../telegram/user.js";
import type * as telegram_webhook from "../telegram/webhook.js";
import type * as test_testTypes from "../test/testTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
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
  migrations: typeof migrations;
  poll: typeof poll;
  "shared/indexByUniqueIdentifier": typeof shared_indexByUniqueIdentifier;
  "shared/normalizeWhitespace": typeof shared_normalizeWhitespace;
  "shared/recordIncrement": typeof shared_recordIncrement;
  "shared/userType": typeof shared_userType;
  tally: typeof tally;
  "telegram/bot": typeof telegram_bot;
  "telegram/inlineMessages": typeof telegram_inlineMessages;
  "telegram/openid": typeof telegram_openid;
  "telegram/poll": typeof telegram_poll;
  "telegram/user": typeof telegram_user;
  "telegram/webhook": typeof telegram_webhook;
  "test/testTypes": typeof test_testTypes;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
};
