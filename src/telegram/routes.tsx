import Vote from "@/components/Vote";
import { Route } from "react-router";
import Results from "../components/Results";
import Settings from "../components/Settings";
import Layout from "./Layout";
import NewPoll from "./NewPoll";
import Start from "./Start";
import Theme from "./Theme";

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
