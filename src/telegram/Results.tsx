import PollNav from "@/components/PollNav";
import PollPage from "@/components/PollPage";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import type { PollResults } from "@convex/tally";
import { indexByUniqueIdentifier } from "@convex/util/indexByUniqueIdentifier";
import { useQuery } from "convex/react";
import { useParams } from "react-router";

export default function ResultsPageLoader() {
  const pollId = useParams().pollId! as Id<"poll">;
  const poll = useQuery(api.poll.get, { id: pollId });
  const candidates = useQuery(api.candidate.list, { pollId });
  const results = useQuery(api.poll.getResults, { id: pollId });
  const { user } = useUser();

  if (!(poll && candidates && results)) return <div>loading...</div>;

  return (
    <ResultsPage
      poll={poll}
      candidates={candidates}
      results={results}
      user={user}
    />
  );
}

export function ResultsPage({
  poll,
  candidates,
  results,
  user,
}: {
  poll: Doc<"poll">;
  candidates: Doc<"candidate">[];
  results: PollResults;
  user: ReturnType<typeof useUser>["user"];
}) {
  const candidateMap = indexByUniqueIdentifier(candidates);

  const candidateIds = results.eliminations
    .flatMap(
      (elimination) => Object.keys(elimination.candidates) as Id<"candidate">[],
    )
    .reverse();

  const rounds = results.roundsByCandidate[candidateIds[0]].map(
    (_, i) => i + 1,
  );

  return (
    <PollPage poll={poll}>
      <div className="main-section">
        <PollNav poll={poll} personId={user?.externalId} />
        <table className="results">
          <thead>
            <tr>
              <th></th>
              {rounds.map((round) => (
                <th key={round}>{round}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidateIds.map((candidateId) => {
              const candidate = candidateMap.get(candidateId)!;
              const votesByRound = results.roundsByCandidate[candidateId] || [
                0,
              ];
              return (
                <tr key={candidateId}>
                  <th>{candidate.name}</th>
                  {votesByRound.map((votes, round) => (
                    <td key={round}>{votes}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PollPage>
  );
}
