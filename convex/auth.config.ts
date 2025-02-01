// import { validateWebAppData } from "@grammyjs/validator";
// import type { WebAppUser } from "@twa-dev/types";

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
