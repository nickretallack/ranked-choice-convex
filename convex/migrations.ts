import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const normalizeCandidateNames = migrations.define({
  table: "candidate",
  migrateOne: async (ctx, candidate) => {
    if (candidate.normalizedName === undefined) {
      await ctx.db.patch(candidate._id, {
        normalizedName: candidate.name.toLowerCase().normalize(),
      });
    }
  },
});
