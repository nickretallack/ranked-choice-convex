import { describe, expect, it } from "vitest";
import { Id } from "../_generated/dataModel";
import { makeRankingsByCandidate } from "../tally";
import { SingleArgument } from "./testTypes";

const candidate1 = "1" as Id<"candidate">;
const candidate2 = "2" as Id<"candidate">;
const candidate3 = "3" as Id<"candidate">;

describe("makeRankingsByCandidate", () => {
  it.each([
    [[], new Map()],
    [[[candidate1]], new Map([[candidate1, [[]]]])],
    [[[candidate1, candidate2]], new Map([[candidate2, [[candidate1]]]])],
    [
      [
        [candidate3, candidate2, candidate1],
        [candidate3, candidate1, candidate2],
      ],
      new Map([
        [candidate1, [[candidate3, candidate2]]],
        [candidate2, [[candidate3, candidate1]]],
      ]),
    ],
  ] as SingleArgument<typeof makeRankingsByCandidate>[])(
    "%p ballots",
    (votes, expected) => {
      const ballots = makeRankingsByCandidate(votes);
      expect(ballots).toEqual(expected);
    },
  );
});
