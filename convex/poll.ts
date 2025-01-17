import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const get = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getResults = query({
  args: { id: v.id("poll") },
  handler: async (ctx, { id }): Promise<PollResults> => {
    const poll = await ctx.db.get(id);
    if (!poll) throw new Error("Poll not found");

    // TODO: check for disqalified candidates?

    const ballots = await ctx.db
      .query("ballot")
      .withIndex("by_pollId", (q) => q.eq("pollId", id))
      .collect();

    const rankings = ballots.map((ballot) => ballot.ranking.reverse());
    const rankingsByCandidate = makeRankingsByCandidate(rankings);
    const { eliminations, roundsByCandidate } =
      calculateResults(rankingsByCandidate);

    return { eliminations, roundsByCandidate };
  },
});

export type PollResults = {
  eliminations: Elimination[];
  roundsByCandidate: Map<Id<"candidate">, number[]>;
};

type Ranking = Id<"candidate">[];
export type RankingsByCandidate = Map<Id<"candidate">, Ranking[]>;
type RedistributedVotes = {
  nextChoice: Map<Id<"candidate">, number>;
  ballotsExhausted: number;
};
type Losers = {
  score: number;
  candidateIds: Id<"candidate">[];
};
type Elimination = {
  votes: number;
  candidates: Map<Id<"candidate">, RedistributedVotes>;
};

function makeRankingsByCandidate(rankings: Ranking[]) {
  const rankingsByCandidate: RankingsByCandidate = new Map();
  for (const ranking of rankings) {
    if (!ranking.length) continue;
    const candidateId = ranking.pop()!;
    const rankings = rankingsByCandidate.get(candidateId) || ([] as Ranking[]);
    rankings.push(ranking);
    rankingsByCandidate.set(candidateId, rankings);
  }
  return rankingsByCandidate;
}

function calculateResults(rankingsByCandidate: RankingsByCandidate) {
  const eliminations: Elimination[] = [];
  const roundsByCandidate = new Map<Id<"candidate">, number[]>();

  while (rankingsByCandidate.size) {
    // Record the current vote counts.
    for (const [candidateId, ballots] of rankingsByCandidate) {
      const counts = roundsByCandidate.get(candidateId) || [];
      counts.push(ballots.length);
      roundsByCandidate.set(candidateId, counts);
    }

    // Find out who lost.  Includes ties.
    const newLosers = findLosers(rankingsByCandidate);
    // TODO: implement a tie-breaker?
    // Scottish RCV breaks ties using the score from the previous round.
    // San Francisco RCV breaks ties randomly.
    // They're both random on the first round.

    const candidateRedistributedVotes = new Map<
      Id<"candidate">,
      RedistributedVotes
    >();
    eliminations.push({
      votes: newLosers.score,
      candidates: candidateRedistributedVotes,
    });

    const freeBallots = new Map<Id<"candidate">, Ranking[]>();
    for (const candidateId of newLosers.candidateIds) {
      freeBallots.set(candidateId, rankingsByCandidate.get(candidateId)!);
      rankingsByCandidate.delete(candidateId);
    }

    for (const [candidateId, ballots] of freeBallots) {
      const redistributedVotes = {
        ballotsExhausted: 0,
        nextChoice: new Map(),
      } as RedistributedVotes;
      candidateRedistributedVotes.set(candidateId, redistributedVotes);

      // Redistribute the ballots to candidates that haven't been eliminated.
      for (const ballot of ballots) {
        moveBallotToNextChoice(ballot, rankingsByCandidate, redistributedVotes);
      }
    }
  }

  return { eliminations, roundsByCandidate };
}

function findLosers(rankingsByCandidate: RankingsByCandidate): Losers {
  let lowestScore = Infinity;
  let candidateIds: Id<"candidate">[] = [];
  rankingsByCandidate.forEach((ballots, candidateId) => {
    const score = ballots.length;
    if (score == lowestScore) {
      candidateIds.push(candidateId);
    } else if (score < lowestScore) {
      lowestScore = score;
      candidateIds = [candidateId];
    }
  });
  return {
    score: lowestScore,
    candidateIds,
  };
}

function moveBallotToNextChoice(
  ballot: Ranking,
  rankingsByCandidate: RankingsByCandidate,
  redistributedVotes: RedistributedVotes,
) {
  // consume remaining choices until we find a valid one, or run out
  while (ballot.length) {
    const newCandidateId = ballot.pop()!;
    if (rankingsByCandidate.has(newCandidateId)) {
      // found someone else to vote for
      rankingsByCandidate.get(newCandidateId)!.push(ballot);
      mapIncrement(redistributedVotes.nextChoice, newCandidateId);
      return;
    }
  }
  // ballot exhausted
  redistributedVotes.ballotsExhausted += 1;
}

function mapIncrement<Key>(map: Map<Key, number>, key: Key) {
  const value = map.get(key) || 0;
  map.set(key, value + 1);
}
