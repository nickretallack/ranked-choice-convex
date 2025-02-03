import Loading from "@/components/Loading";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { indexByUniqueIdentifier } from "@convex/shared/indexByUniqueIdentifier";
import Telegram from "@twa-dev/sdk";
import { BottomBar, MainButton } from "@twa-dev/sdk/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { PollContext } from "./Layout";

export default function ResultsPage() {
  const { poll, isYourPoll } = useOutletContext<PollContext>();
  const navigate = useNavigate();
  const closePoll = useMutation(api.poll.close);
  const reopenPoll = useMutation(api.poll.reopen);
  const resultsAvailable = poll.liveResults || poll.closed;
  const shouldNavigateAway = !isYourPoll && !resultsAvailable;

  // If you're not the creator and the results aren't available yet, navigate to the vote page
  useEffect(() => {
    if (shouldNavigateAway) {
      void navigate(`/poll/${poll._id}/vote`);
    }
  }, [shouldNavigateAway, poll._id, navigate]);

  return (
    <>
      {resultsAvailable ? (
        <Results />
      ) : isYourPoll ? (
        <div>Close the poll to view the results.</div>
      ) : (
        <Loading />
      )}

      <BottomBar>
        {isYourPoll &&
          (poll.closed ? (
            <MainButton
              text="Reopen Poll"
              onClick={() =>
                void reopenPoll({
                  id: poll._id,
                  telegramInitData: Telegram.initData,
                })
              }
            />
          ) : (
            <MainButton
              text="Close Poll"
              onClick={() =>
                void closePoll({
                  id: poll._id,
                  telegramInitData: Telegram.initData,
                })
              }
            />
          ))}
      </BottomBar>
    </>
  );
}

export function Results() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const candidates = useQuery(api.candidate.list, { pollId: poll._id });
  const results = useQuery(api.poll.getResults, { id: poll._id });

  if (!(poll && candidates && results)) return <div>loading...</div>;

  if (!results.eliminations.length) return <div>No results yet</div>;

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
          const votesByRound = results.roundsByCandidate[candidateId] || [0];
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
  );
}
