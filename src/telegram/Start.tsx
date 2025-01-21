import Loading from "@/components/Loading";
import Telegram from "@twa-dev/sdk";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function TelegramStart() {
  const navigate = useNavigate();

  useEffect(() => {
    const pollId = Telegram.initDataUnsafe.start_param;
    void navigate(`/telegram/poll/${pollId}/vote`)?.catch((error) => {
      console.error(error);
    });
  }, [navigate]);

  return <Loading />;
}
