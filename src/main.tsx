import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import NewPoll from "./telegram/NewPoll.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class">
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/telegram/polls/new" element={<NewPoll />} />
          </Routes>
        </BrowserRouter>
      </ConvexProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
