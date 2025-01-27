import Loading from "@/components/Loading";
import PollNav from "@/components/PollNav";
import useUser from "@/hooks/useUser";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Outlet, useParams } from "react-router";

export type PollContext = {
  poll: Doc<"poll">;
  isYourPoll: boolean;
};

export default function TelegramLayout() {
  const pollId = useParams().pollId! as Id<"poll">;
  const poll = useQuery(api.poll.get, { id: pollId });
  const user = useUser();
  if (poll === undefined) return <Loading />;
  if (poll === null) return <div>Poll not found</div>;
  const isYourPoll = user.id === poll.creatorId;
  const context: PollContext = {
    poll,
    isYourPoll,
  };

  return (
    <div className="poll-page">
      <h1>{poll.title}</h1>
      <PollNav poll={poll} isYourPoll={isYourPoll} />
      <div className="container">
        <Outlet context={context} />
      </div>
    </div>
  );
}
