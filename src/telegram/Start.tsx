import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import Telegram from "@twa-dev/sdk";
import { useNavigate } from "react-router";

export default function Start() {
  const validateUser = useAction(api.telegram.actions.validateUser);
  const navigate = useNavigate();
  const [isInvalid, setIsInvalid] = useState(false);
  useEffect(() => {
    const handler = async () => {
      const isValid = await validateUser({ initData: Telegram.initData });
      if (!isValid) {
        setIsInvalid(true);
        return;
      }
      const pollId = Telegram.initDataUnsafe.start_param;
      await navigate(`/telegram/poll/${pollId}`);
    };
    handler().catch(console.error);
  }, [validateUser, navigate]);

  return (
    <div>
      {isInvalid ? "Invalid telegram user details." : "Just a moment..."}
    </div>
  );
}
