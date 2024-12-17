import { httpRouter } from "convex/server";
import { webhook } from "./telegram/webhook";
import { openidConfiguration, jwks } from "./telegram/openid";

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
