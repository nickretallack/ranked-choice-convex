import Loading from "@/components/Loading";
import { useAuthActions } from "@convex-dev/auth/react";
import Telegram from "@twa-dev/sdk";
import { useConvexAuth } from "convex/react";
import { useCallback, useEffect } from "react";
import { Outlet } from "react-router";

export default function SeamlessSignIn() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();

  const seamlessSignIn = useCallback(async () => {
    if (isLoading) return;

    await signIn("telegram", {
      initData: Telegram.initData,
    });
  }, [isLoading, signIn]);

  useEffect(() => {
    seamlessSignIn().catch(console.error);
  }, [seamlessSignIn]);

  if (isAuthenticated) {
    return <Outlet />;
  }

  // if (error) {
  //   return <div>{error}</div>;
  // }

  return <Loading />;
}
