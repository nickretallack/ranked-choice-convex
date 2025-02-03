"use node";

import { verifyKey } from "discord-interactions";
import {
  APIInteraction,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from "discord.js";
import { httpAction } from "../_generated/server";

export default httpAction(async (ctx, request) => {
  // Verify request is from Discord
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const body = await request.text();

  const isValid = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_BOT_PUBLIC_KEY!,
  );

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const interaction = JSON.parse(body) as APIInteraction;
  return handleInteraction(interaction);
});

function handleInteraction(interaction: APIInteraction) {
  if (interaction.type === InteractionType.MessageComponent) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Here's your login link...",
          flags: MessageFlags.Ephemeral,
        },
      }),
    );
  }
  return new Response("???");
}
