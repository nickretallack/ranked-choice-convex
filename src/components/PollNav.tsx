// import { Person, Poll } from "@prisma/client";
import { useUser } from "@clerk/clerk-react";
import { Doc } from "@convex/_generated/dataModel";
import { NavLink, useOutletContext } from "react-router";

export default function PollNav() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const { user } = useUser();
  const isYourPoll = user?.externalId === poll.creatorId;
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
