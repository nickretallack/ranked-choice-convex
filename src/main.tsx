import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import {
  ConvexProvider,
  ConvexProviderWithAuth,
  ConvexReactClient,
  useAction,
} from "convex/react";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import TelegramRoutes from "./telegram/routes.tsx";
import { api } from "@convex/_generated/api.js";
import Telegram from "@twa-dev/sdk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// function useMyAuth() {
//   console.log("useMyAuth");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const getToken = useCallback(async () => {
//     console.log("getToken");
//     setIsLoading(true);
//     try {
//       const token = await convex.action(api.telegram.actions.validateUser, {
//         initData: Telegram.initData,
//       });
//       setIsAuthenticated(true);
//       setIsLoading(false);
//       return token;
//     } catch (error) {
//       setIsAuthenticated(false);
//       setIsLoading(false);
//       return null;
//     }
//   }, []);
//   const fetchAccessToken = useCallback(
//     // @ts-expect-error not using this yet
//     async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
//       debugger;
//       console.log("fetchAccessToken");
//       return await getToken();
//     },
//     [getToken],
//   );
//   return useMemo(
//     () => ({
//       isLoading,
//       isAuthenticated,
//       fetchAccessToken,
//     }),
//     [isLoading, isAuthenticated, fetchAccessToken],
//   );
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class">
      <ClerkProvider publishableKey="pk_test_d2l0dHktc2x1Zy0zMS5jbGVyay5hY2NvdW50cy5kZXYk">
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {/* <ConvexProvider client={convex as any}> */}
          {/* <ConvexProviderWithAuth client={convex} useAuth={useMyAuth}> */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              {TelegramRoutes}
            </Routes>
          </BrowserRouter>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
