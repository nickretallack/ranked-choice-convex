import PollNav from "@/components/PollNav";
import PollPage from "@/components/PollPage";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import type { PollResults } from "@convex/tally";
import { indexByUniqueIdentifier } from "@convex/util/indexByUniqueIdentifier";
import Telegram from "@twa-dev/sdk";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useOutletContext } from "react-router";

export default function ResultsPageLoader() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const candidates = useQuery(api.candidate.list, { pollId: poll._id });
  const results = useQuery(api.poll.getResults, { id: poll._id });
  const { user } = useUser();

  if (!(poll && candidates && results)) return <div>loading...</div>;

  return (
    <ResultsPage
      poll={poll}
      candidates={candidates}
      results={results}
      user={user}
      isYourPoll={user?.externalId === poll.creatorId}
    />
  );
}

export function ResultsPage({
  poll,
  candidates,
  results,
  user,
  isYourPoll,
}: {
  poll: Doc<"poll">;
  candidates: Doc<"candidate">[];
  results: PollResults;
  user: ReturnType<typeof useUser>["user"];
  isYourPoll: boolean;
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

  const closePoll = useMutation(api.poll.close);
  const reopenPoll = useMutation(api.poll.reopen);

  useEffect(() => {
    if (!isYourPoll) return;

    if (poll.closed) {
      const reopenHandler = (async () => {
        await reopenPoll({ id: poll._id });
      }) as () => void;
      Telegram.MainButton.show().setText("Reopen Poll").onClick(reopenHandler);
      return () => {
        Telegram.MainButton.offClick(reopenHandler).hide();
      };
    } else {
      const closeHandler = (async () => {
        await closePoll({ id: poll._id });
      }) as () => void;
      Telegram.MainButton.show().setText("Close Poll").onClick(closeHandler);
      return () => {
        Telegram.MainButton.offClick(closeHandler).hide();
      };
    }
  }, [poll.closed, closePoll, reopenPoll, poll._id, isYourPoll]);

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
