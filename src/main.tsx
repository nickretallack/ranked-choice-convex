import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import "./main.css";
import TelegramRoutes from "./telegram/routes.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>{TelegramRoutes}</Routes>
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>,
);
