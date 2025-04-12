import Loading from "@/components/Loading";
import { PollLayout } from "@/Layout";
import { api } from "@convex/_generated/api";
import Telegram from "@twa-dev/sdk";
import { useQuery } from "convex/react";

export default function TelegramAuthPollLayout() {
  const telegramUser = useQuery(api.telegram.user.getByInitData, {
    initData: Telegram.initData,
  });
  if (telegramUser === undefined) return <Loading />;
  return <PollLayout userId={telegramUser?.userId || null} />;
}
