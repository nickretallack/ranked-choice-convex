// import { validateWebAppData } from "@grammyjs/validator";
// import type { WebAppUser } from "@twa-dev/types";

export default {
  providers: [
    // {
    //   domain: "https://witty-slug-31.clerk.accounts.dev",
    //   applicationID: "convex",
    // },
    // {
    //   domain: "https://lovely-ox-258.convex.site",
    //   applicationID: "convex2",
    // },
    {
      domain: "https://lovely-ox-258.convex.site",
      applicationID: "convex",
      // validateToken: async (token) => {
      //   return {
      //     sub: token.sub,
      //     // Include other user info you want available in ctx.auth
      //     name: token.name,
      //     picture: token.picture,
      //     nickname: token.nickname,
      //   };
      // },
    },
    // {
    //   domain:
    // }
    // {
    //   // Implement token validation for Telegram's signed data
    //   validateToken: async (token: string) => {
    //     // Now you can use Node.js crypto via grammyjs/validator
    //     const isValid = validateWebAppData(
    //       process.env.TELEGRAM_BOT_SECRET!,
    //       new URLSearchParams(token),
    //     );

    //     if (!isValid) return null;

    //     const user = JSON.parse(
    //       new URLSearchParams(token).get("user")!,
    //     ) as WebAppUser;
    //     return {
    //       subject: user.id.toString(),
    //       issuer: "telegram",
    //       name: user.username,
    //       picture: user.photo_url,
    //       nickname: user.username,
    //       given_name: user.first_name,
    //       family_name: user.last_name,
    //     };
    //   },
    // },
  ],
};
