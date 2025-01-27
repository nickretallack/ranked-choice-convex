import { Doc } from "@convex/_generated/dataModel";
import { PropsWithChildren } from "react";
import PollNav from "./PollNav";

type Props = PropsWithChildren<{ poll: Doc<"poll"> }>;

export default function PollPage({ poll, children }: Props) {
  return (
    <div className="poll-page">
      <h1>{poll.title}</h1>
      <PollNav />

      {children}
    </div>
  );
}
