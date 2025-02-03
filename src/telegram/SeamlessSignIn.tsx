import Loading from "@/components/Loading";
import { useAuthActions } from "@convex-dev/auth/react";
import Telegram from "@twa-dev/sdk";
import { useConvexAuth } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";

export default function SeamlessSignIn() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const seamlessSignIn = useCallback(async () => {
    if (isReady) return;
    if (isLoading) return;
    if (isAuthenticated) {
      await signOut();
      return;
    }
    try {
      await signIn("telegram", {
        initData: Telegram.initData,
      });
      setIsReady(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }, [signIn, signOut, isLoading, isAuthenticated, isReady]);

  useEffect(() => {
    void seamlessSignIn();
  }, [seamlessSignIn]);

  if (isReady) {
    return <Outlet />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <Loading />;
}
