// import { Person, Poll } from "@prisma/client";
import { Doc } from "@convex/_generated/dataModel";
import { NavLink } from "react-router";

export default function PollNav({
  poll,
  personId,
}: {
  poll: Doc<"poll">;
  personId: string | null | undefined;
}) {
  console.log("personId", personId);
  console.log("poll.creatorId", poll.creatorId);
  return (
    <nav className="subnav">
      <NavLink to={`/telegram/poll/${poll._id}/vote`} end>
        Your Ranking
      </NavLink>
      <NavLink to={`/telegram/poll/${poll._id}/results`} end>
        Results
      </NavLink>
      {personId === poll.creatorId && (
        <NavLink to={`/telegram/poll/${poll._id}/settings`} end>
          Settings
        </NavLink>
      )}
    </nav>
  );
}
