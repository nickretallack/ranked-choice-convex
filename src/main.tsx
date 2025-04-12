import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Vote from "./components/Vote.tsx";
import Home from "./Home";
import ConvexAuthPollLayout from "./Layout";
import "./main.css";
import TelegramRoutes from "./telegram/routes.tsx";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <Routes>
          {TelegramRoutes}
          <Route path="/" element={<Home />} />
          <Route path="poll/:pollId" element={<ConvexAuthPollLayout />}>
            <Route path="vote" element={<Vote />} />
            {/* <Route path="results" element={<Results />} />
            <Route path="settings" element={<Settings />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </ConvexAuthProvider>
  </React.StrictMode>,
);
