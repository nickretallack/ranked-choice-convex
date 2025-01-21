import Telegram from "@twa-dev/sdk";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Start() {
  const navigate = useNavigate();

  useEffect(() => {
    const pollId = Telegram.initDataUnsafe.start_param;
    void navigate(`/telegram/poll/${pollId}/vote`)?.catch((error) => {
      console.error(error);
    });
  }, [navigate]);

  return <div>Just a moment...</div>;
}
