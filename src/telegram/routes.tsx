import { Route } from "react-router";
import NewPoll from "./NewPoll";
import Start from "./Start";
import Poll from "./Poll";
import Vote from "./Vote";

const TelegramRoutes = (
  <Route path="telegram">
    <Route path="polls/new" element={<NewPoll />} />
    <Route path="start" element={<Start />} />
    <Route path="poll/:pollId">
      <Route path="vote" element={<Vote />} />
    </Route>
  </Route>
);
export default TelegramRoutes;
