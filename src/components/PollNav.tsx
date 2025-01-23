// import { Person, Poll } from "@prisma/client";
import { Doc } from "@convex/_generated/dataModel";
import { NavLink } from "react-router";

export default function PollNav({
  poll,
  userId,
}: {
  poll: Doc<"poll">;
  userId: string | null | undefined;
}) {
  const isYourPoll = userId === poll.creatorId;
  return (
    <nav className="subnav">
      <NavLink to={`/telegram/poll/${poll._id}/vote`} end>
        Your Ranking
      </NavLink>
      {(poll.liveResults || isYourPoll) && (
        <NavLink to={`/telegram/poll/${poll._id}/results`} end>
          Results
        </NavLink>
      )}
      {isYourPoll && (
        <NavLink to={`/telegram/poll/${poll._id}/settings`} end>
          Settings
        </NavLink>
      )}
    </nav>
  );
}
