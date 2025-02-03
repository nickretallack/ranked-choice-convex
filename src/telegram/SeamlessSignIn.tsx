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

  const seamlessSignIn = useCallback(async () => {
    if (isLoading) return;
    try {
      await signIn("telegram", {
        initData: Telegram.initData,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      await signOut();
    }
  }, [signIn, signOut, isLoading]);

  useEffect(() => {
    void seamlessSignIn();
  }, [seamlessSignIn]);

  if (isAuthenticated) {
    return <Outlet />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <Loading />;
}
