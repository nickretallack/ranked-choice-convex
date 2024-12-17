import { httpAction } from "../_generated/server";

export const openidConfiguration = httpAction(async () => {
  return new Response(
    JSON.stringify({
      issuer: "https://lovely-ox-258.convex.site",
      jwks_uri: "https://lovely-ox-258.convex.site/.well-known/jwks.json",
      id_token_signing_alg_values_supported: ["HS256"],
      subject_types_supported: ["public"],
      response_types_supported: ["id_token"],
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
});

export const jwks = httpAction(async () => {
  const secret = process.env.TELEGRAM_BOT_SECRET!;

  return new Response(
    JSON.stringify({
      keys: [
        {
          kty: "oct", // Key Type: Octet sequence (symmetric)
          kid: "telegram-key",
          use: "sig",
          alg: "HS256",
          k: Buffer.from(secret).toString("base64url"), // Base64URL-encoded key
        },
      ],
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
});
