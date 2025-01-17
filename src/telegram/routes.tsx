import { Route } from "react-router";
import NewPoll from "./NewPoll";
import Results from "./Results";
import Start from "./Start";
import Vote from "./Vote";

const TelegramRoutes = (
  <Route path="telegram">
    <Route path="polls/new" element={<NewPoll />} />
    <Route path="start" element={<Start />} />
    <Route path="poll/:pollId">
      <Route path="vote" element={<Vote />} />
      <Route path="results" element={<Results />} />
    </Route>
  </Route>
);
export default TelegramRoutes;
