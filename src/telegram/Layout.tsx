import Loading from "@/components/Loading";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Outlet, useParams } from "react-router";

export default function TelegramLayout() {
  const pollId = useParams().pollId! as Id<"poll">;
  const poll = useQuery(api.poll.get, { id: pollId });
  if (poll === undefined) return <Loading />;
  if (poll === null) return <div>Poll not found</div>;

  return <Outlet context={{ poll }} />;
}
