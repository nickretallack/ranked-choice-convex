import { Doc } from "@convex/_generated/dataModel";
import Telegram from "@twa-dev/sdk";
import { NavLink } from "react-router";

export default function PollNav({
  poll,
  isYourPoll,
}: {
  poll: Doc<"poll">;
  isYourPoll: boolean;
}) {
  const prefix = Telegram.initData ? "/telegram" : "";

  return (
    <nav className="tabs">
      <NavLink to={`${prefix}/poll/${poll._id}/vote`} end>
        Your Ranking
      </NavLink>
      {(poll.liveResults || isYourPoll) && (
        <NavLink to={`${prefix}/poll/${poll._id}/results`} end>
          Results
        </NavLink>
      )}
      {isYourPoll && (
        <NavLink to={`${prefix}/poll/${poll._id}/settings`} end>
          Settings
        </NavLink>
      )}
    </nav>
  );
}
