import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { api } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { httpAction } from "../_generated/server";

function pollMessage(poll: Doc<"poll">) {
  const redirectTo = `/polls/${poll._id}`;
  const state = encodeURIComponent(JSON.stringify({ redirectTo }));
  const redirectUri = encodeURIComponent(
    `https://${process.env.SITE_URL}/auth/callback`,
  );

  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Poll: ${poll.title}`,
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2,
              style: 1,
              label: "Vote",
              url: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_APPLICATION_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify&state=${state}`,
            },
            // {
            //   type: 2, // Button
            //   style: 1, // Primary (blue)
            //   label: "I want to vote!",
            //   custom_id: `vote_button:${pollId}`, // We'll handle this in MESSAGE_COMPONENT interaction
            // },
          ],
        },
      ],
    },
  });
}

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
        const subcommand = interaction.data.options?.[0];

        switch (subcommand?.name) {
          case "create": {
            const options = interaction.data.options;
            const title = options[0].value as string;
            const liveResults = (options[1].value as boolean) || true;
            const allowNominations = (options[2].value as boolean) || false;
            const candidates = options[3].value as string[];
            const poll = await ctx.runMutation(api.discord.poll.create, {
              discordMember: interaction.member,
              title,
              liveResults,
              allowNominations,
              candidates,
            });
            return pollMessage(poll);
          }
          case "share": {
            const pollId = interaction.data.options?.[0].value as Id<"poll">;
            const poll = await ctx.runQuery(api.poll.get, { id: pollId });
            if (!poll) {
              return Response.json(
                { error: "Poll not found" },
                { status: 404 },
              );
            }
            return pollMessage(poll);
          }
        }
      }
      return Response.json({ error: "Unknown command" }, { status: 400 });
    }

    case InteractionType.MESSAGE_COMPONENT: {
      const parts = interaction.data.custom_id.split(":");
      if (parts[0] === "vote_button") {
        // const pollId = parts[1];
        // return Response.json({
        //   type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        //   data: {
        //     content: "Here's your link to vote on ",
        //     components: [
        //       {
        //         type: 1, // Action Row
        //         components: [
        //           {
        //             type: 2, // Button
        //             style: 5, // Link button
        //             label: "Vote",
        //             // TODO: perhaps we generate a value derived from the message id and a secret to verify you got here legitimately?
        //             // But what do we store?  Something?  Perhaps we use the user's id as salt or something?
        //             url: `https://${process.env.SITE_URL}/discord/polls/${pollId}`,
        //           },
        //         ],
        //       },
        //     ],
        //     flags: InteractionResponseFlags.EPHEMERAL,
        //   },
        // });
      }
      return Response.json({ error: "Unknown component" }, { status: 400 });
    }

    case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
      if (
        interaction.data.name === "poll" &&
        interaction.data.options?.[0].name === "share"
      ) {
        const user = await ctx.runQuery(api.discord.user.get, {
          discordUserId: interaction.member.user.id,
        });
        if (!user) {
          return Response.json({
            choices: [],
          });
        }
        // TODO: text search?
        // const search = interaction.data.options[0].options?.[0].value as string;
        const polls = await ctx.runQuery(api.poll.listForUser, {
          userId: user,
        });

        return Response.json({
          choices: polls
            .map((poll) => ({
              name: poll.title,
              value: poll._id,
            }))
            .slice(0, 25),
        });
      }
      return Response.json({
        choices: [],
      });
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
