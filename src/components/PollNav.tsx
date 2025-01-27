// import { Person, Poll } from "@prisma/client";
import { Doc } from "@convex/_generated/dataModel";
import { NavLink } from "react-router";

export default function PollNav({
  poll,
  isYourPoll,
}: {
  poll: Doc<"poll">;
  isYourPoll: boolean;
}) {
  return (
    <nav className="tabs">
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
