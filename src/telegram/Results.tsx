import Loading from "@/components/Loading";
import PollNav from "@/components/PollNav";
import PollPage from "@/components/PollPage";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { indexByUniqueIdentifier } from "@convex/util/indexByUniqueIdentifier";
import Telegram from "@twa-dev/sdk";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";

export default function ResultsPage() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const { user } = useUser();
  const isYourPoll = user?.externalId === poll.creatorId;
  const navigate = useNavigate();
  const closePoll = useMutation(api.poll.close);
  const reopenPoll = useMutation(api.poll.reopen);

  useEffect(() => {
    if (!isYourPoll) {
      if (!poll.liveResults) {
        void navigate(`/poll/${poll._id}/vote`);
      }
      return;
    }

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
  }, [
    poll.closed,
    poll.liveResults,
    poll._id,
    isYourPoll,
    closePoll,
    reopenPoll,
    navigate,
  ]);

  let content = <Loading />;

  if (!poll.liveResults && !poll.closed) {
    console.log("poll.liveResults", poll.liveResults);
    console.log("poll.closed", poll.closed);
    if (isYourPoll) {
      content = <div>Close the poll to view the results.</div>;
    }
  } else {
    content = <Results />;
  }

  return (
    <PollPage poll={poll}>
      <div className="main-section">
        <PollNav poll={poll} userId={user?.externalId} />
        {content}
      </div>
    </PollPage>
  );
}

export function Results() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const candidates = useQuery(api.candidate.list, { pollId: poll._id });
  const results = useQuery(api.poll.getResults, { id: poll._id });

  if (!(poll && candidates && results)) return <div>loading...</div>;

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
