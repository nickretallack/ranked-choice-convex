import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { api } from "../_generated/api";
import { httpAction } from "../_generated/server";

export default httpAction(async (ctx, request): Promise<Response> => {
  // Verify request is from Discord
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const body = await request.text();

  const isValid = await verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_BOT_PUBLIC_KEY!,
  );

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const interaction = JSON.parse(body);
  console.log(interaction);
  switch (interaction.type) {
    case InteractionType.APPLICATION_COMMAND: {
      if (interaction.data.name === "poll") {
        const options = interaction.data.options;
        const title = options[0].value as string;
        const liveResults = (options[1].value as boolean) || true;
        const allowNominations = (options[2].value as boolean) || false;
        const candidates = options[3].value as string[];
        const pollId = await ctx.runMutation(api.discord.poll.create, {
          discordMember: interaction.member,
          title,
          liveResults,
          allowNominations,
          candidates,
        });
        return Response.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Poll: ${title}`,
            components: [
              {
                type: 1, // Action Row
                components: [
                  {
                    type: 2, // Button
                    style: 1, // Primary (blue)
                    label: "I want to vote!",
                    custom_id: `vote_button:${pollId}`, // We'll handle this in MESSAGE_COMPONENT interaction
                  },
                ],
              },
            ],
          },
        });
      }
      return Response.json({ error: "Unknown command" }, { status: 400 });
    }

    case InteractionType.MESSAGE_COMPONENT: {
      const parts = interaction.data.custom_id.split(":");
      if (parts[0] === "vote_button") {
        const pollId = parts[1];
        return Response.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Here's your link to vote on ",
            components: [
              {
                type: 1, // Action Row
                components: [
                  {
                    type: 2, // Button
                    style: 5, // Link button
                    label: "Vote",
                    // TODO: perhaps we generate a value derived from the message id and a secret to verify you got here legitimately?
                    // But what do we store?  Something?  Perhaps we use the user's id as salt or something?
                    url: `https://${process.env.SITE_ROOT_URL}/discord/polls/${pollId}`,
                  },
                ],
              },
            ],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      return Response.json({ error: "Unknown component" }, { status: 400 });
    }

    case InteractionType.PING: {
      return Response.json({
        type: InteractionResponseType.PONG,
      });
    }
    default:
      return Response.json({ error: "Unknown interaction" }, { status: 400 });
  }
});
