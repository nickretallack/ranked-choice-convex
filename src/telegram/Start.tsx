import { useEffect, useState } from "react";
import { useAction, useConvex } from "convex/react";
import { api } from "@convex/_generated/api";
import Telegram from "@twa-dev/sdk";
import { useNavigate } from "react-router";

export default function Start() {
  const validateUser = useAction(api.telegram.actions.validateUser);
  const navigate = useNavigate();

  const convex = useConvex();

  const [isInvalid, setIsInvalid] = useState(false);
  useEffect(() => {
    // const handler = async () => {
    convex.setAuth(
      async () => await validateUser({ initData: Telegram.initData }),
      (isAuthenticated) => {
        console.log("isAuthenticated", isAuthenticated);
        if (isAuthenticated) {
          const pollId = Telegram.initDataUnsafe.start_param;
          navigate(`/telegram/poll/${pollId}`) as void;
        } else {
          setIsInvalid(true);
        }
      },
    );
  }, [convex, navigate, validateUser]);

  return (
    <div>
      {isInvalid ? "Invalid telegram user details." : "Just a moment..."}
    </div>
  );
}
