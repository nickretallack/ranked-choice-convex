import { httpRouter } from "convex/server";
import { jwks, openidConfiguration } from "./telegram/openid";
import { webhook } from "./telegram/webhook";

const http = httpRouter();

http.route({
  path: "/telegram/bot/webhook",
  method: "POST",
  handler: webhook,
});

// OpenID Connect endpoints
http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: openidConfiguration,
});

http.route({
  path: "/.well-known/jwks.json",
  method: "GET",
  handler: jwks,
});

export default http;
