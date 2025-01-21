import { describe, expect, it } from "vitest";
import { Id } from "../_generated/dataModel";
import { calculateResults } from "../tally";
import { SingleArgument } from "./testTypes";

const candidate1 = "1" as Id<"candidate">;
const candidate2 = "2" as Id<"candidate">;
const candidate3 = "3" as Id<"candidate">;

describe("calculateResults", () => {
  it.each([
    [new Map(), { eliminations: [], roundsByCandidate: {} }],
    [
      new Map([[candidate1, [[]]]]),
      {
        eliminations: [
          {
            votes: 1,
            candidates: {
              [candidate1]: { ballotsExhausted: 1, nextChoice: {} },
            },
          },
        ],
        roundsByCandidate: { [candidate1]: [1] },
      },
    ],
    [
      new Map([[candidate2, [[candidate1]]]]),
      {
        eliminations: [
          {
            votes: 1,
            candidates: {
              [candidate2]: { ballotsExhausted: 1, nextChoice: {} },
            },
          },
        ],
        roundsByCandidate: { [candidate2]: [1] },
      },
    ],
    [
      new Map([
        [candidate1, [[], [candidate2], [candidate2]]],
        [candidate2, [[candidate1], []]],
      ]),
      {
        eliminations: [
          {
            votes: 2,
            candidates: {
              [candidate2]: {
                ballotsExhausted: 1,
                nextChoice: { [candidate1]: 1 },
              },
            },
          },
          {
            votes: 4,
            candidates: {
              [candidate1]: { ballotsExhausted: 4, nextChoice: {} },
            },
          },
        ],
        roundsByCandidate: {
          [candidate1]: [3, 4],
          [candidate2]: [2],
        },
      },
    ],
    [
      // this is a tie
      new Map([
        [candidate1, [[candidate3, candidate2]]],
        [candidate2, [[candidate3, candidate1]]],
      ]),
      {
        eliminations: [
          {
            votes: 1,
            candidates: {
              [candidate1]: { ballotsExhausted: 1, nextChoice: {} },
              [candidate2]: { ballotsExhausted: 1, nextChoice: {} },
            },
          },
        ],
        roundsByCandidate: {
          [candidate1]: [1],
          [candidate2]: [1],
        },
      },
    ],
  ] as SingleArgument<typeof calculateResults>[])("%p", (votes, expected) => {
    expect(calculateResults(votes)).toEqual(expected);
  });
});
