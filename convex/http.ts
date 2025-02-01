import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { webhook } from "./telegram/webhook";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/telegram/bot/webhook",
  method: "POST",
  handler: webhook,
});

export default http;
