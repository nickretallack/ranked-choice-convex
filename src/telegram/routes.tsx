import { Route } from "react-router";
import Layout from "./Layout";
import NewPoll from "./NewPoll";
import Results from "./Results";
import Settings from "./Settings";
import Start from "./Start";
import Theme from "./Theme";
import Vote from "./Vote";

const TelegramRoutes = (
  <Route path="telegram" element={<Theme />}>
    <Route path="polls/new" element={<NewPoll />} />
    <Route path="start" element={<Start />} />
    <Route path="poll/:pollId" element={<Layout />}>
      <Route path="vote" element={<Vote />} />
      <Route path="results" element={<Results />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
);
export default TelegramRoutes;
