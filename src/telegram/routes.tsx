import { Route } from "react-router";
import NewPoll from "./NewPoll";
import Start from "./Start";
import Poll from "./Poll";

const TelegramRoutes = (
  <Route path="telegram">
    <Route path="polls/new" element={<NewPoll />} />
    <Route path="start" element={<Start />} />
    <Route path="poll/:pollId" element={<Poll />} />
  </Route>
);
export default TelegramRoutes;
