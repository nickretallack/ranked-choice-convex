import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
export default function Home() {
  const { signIn } = useAuthActions();
  const user = useQuery(api.user.viewer);
  return (
    <div>
      {user && <div>Signed in as {user.name}</div>}
      <button onClick={() => void signIn("discord")}>
        Sign in with Discord
      </button>
    </div>
  );
}
