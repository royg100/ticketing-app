/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bitCheckout from "../bitCheckout.js";
import type * as coupons from "../coupons.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as lectures from "../lectures.js";
import type * as paymentDrafts from "../paymentDrafts.js";
import type * as paymentFulfill from "../paymentFulfill.js";
import type * as seed from "../seed.js";
import type * as stripeCheckout from "../stripeCheckout.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as tickets from "../tickets.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bitCheckout: typeof bitCheckout;
  coupons: typeof coupons;
  events: typeof events;
  http: typeof http;
  lectures: typeof lectures;
  paymentDrafts: typeof paymentDrafts;
  paymentFulfill: typeof paymentFulfill;
  seed: typeof seed;
  stripeCheckout: typeof stripeCheckout;
  stripeWebhook: typeof stripeWebhook;
  tickets: typeof tickets;
  transactions: typeof transactions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
