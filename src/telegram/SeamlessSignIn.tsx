import { useClerk, useSignIn, useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import Telegram from "@twa-dev/sdk";
import { useAction } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";

export default function SeamlessSignIn() {
  const { pathname, search, hash } = useLocation();
  const redirectUrl = `${pathname}${search}${hash}`;
  const validateUser = useAction(api.telegram.actions.validateUser);
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signOut } = useClerk();
  const [error, setError] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();
  const [ready, setReady] = useState(false);

  const seamlessSignIn = useCallback(async () => {
    if (!isLoaded) return;

    // Check who's currently signed in
    if (isSignedIn) {
      if (
        user.publicMetadata.telegramUserId === Telegram.initDataUnsafe.user!.id
      ) {
        // The correct user is already signed in.
        return setReady(true);
      } else {
        // Someone else is signed in.  Log out and redirect back to here to try again.
        return await signOut({ redirectUrl });
      }
    }

    // Get a clerk token
    let token: string;
    try {
      token = await validateUser({
        initData: Telegram.initData,
      });
    } catch (error) {
      console.error(error);
      return setError(String(error));
    }

    // Sign in with clerk
    const signInAttempt = await signIn.create({
      strategy: "ticket",
      ticket: token,
    });

    if (signInAttempt.status === "complete") {
      await setActive({
        session: signInAttempt.createdSessionId,
      });
      return setReady(true);
    } else {
      console.error(signInAttempt);
      return setError(String(signInAttempt.status).replace("_", " "));
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    signIn,
    signOut,
    setActive,
    validateUser,
    redirectUrl,
  ]);

  useEffect(() => {
    seamlessSignIn().catch(console.error);
  }, [seamlessSignIn]);

  if (error) {
    return <div>{error}</div>;
  }

  if (ready) {
    return <Outlet />;
  }

  return <div>Just a moment...</div>;
}
