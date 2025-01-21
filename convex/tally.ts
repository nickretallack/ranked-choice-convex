import { Doc, Id } from "./_generated/dataModel";
import recordIncrement from "./util/recordIncrement";

type RoundsByCandidate = Record<Id<"candidate">, number[]>;
export type PollResults = {
  eliminations: Elimination[];
  roundsByCandidate: RoundsByCandidate;
};
type Ranking = Id<"candidate">[];
export type RankingsByCandidate = Map<Id<"candidate">, Ranking[]>;
type RedistributedVotes = {
  nextChoice: Record<Id<"candidate">, number>;
  ballotsExhausted: number;
};
type Losers = {
  score: number;
  candidateIds: Id<"candidate">[];
};
type CandidateRedistributedVotes = Record<Id<"candidate">, RedistributedVotes>;
type Elimination = {
  votes: number;
  candidates: CandidateRedistributedVotes;
};

export function tallyResults(ballots: Doc<"ballot">[]) {
  const rankings = ballots.map((ballot) => ballot.ranking.reverse());
  const rankingsByCandidate = makeRankingsByCandidate(rankings);
  return calculateResults(rankingsByCandidate);
}

export function makeRankingsByCandidate(rankings: Ranking[]) {
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

export function calculateResults(rankingsByCandidate: RankingsByCandidate) {
  const eliminations: Elimination[] = [];
  const roundsByCandidate: RoundsByCandidate = {};

  while (rankingsByCandidate.size) {
    // Record the current vote counts.
    for (const [candidateId, ballots] of rankingsByCandidate) {
      const counts = roundsByCandidate[candidateId] || [];
      counts.push(ballots.length);
      roundsByCandidate[candidateId] = counts;
    }

    // Find out who lost.  Includes ties.
    const newLosers = findLosers(rankingsByCandidate);
    // TODO: implement a tie-breaker?
    // Scottish RCV breaks ties using the score from the previous round.
    // San Francisco RCV breaks ties randomly.
    // They're both random on the first round.
    const candidateRedistributedVotes: CandidateRedistributedVotes = {};
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
        nextChoice: {},
      } as RedistributedVotes;
      candidateRedistributedVotes[candidateId] = redistributedVotes;

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
      recordIncrement(redistributedVotes.nextChoice, newCandidateId);
      return;
    }
  }
  // ballot exhausted
  redistributedVotes.ballotsExhausted += 1;
}
