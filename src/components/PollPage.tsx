import { Doc } from "@convex/_generated/dataModel";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ poll: Doc<"poll"> }>;

export default function PollPage({ poll, children }: Props) {
  return (
    <div className="poll-page">
      <h1 className="poll-title">{poll.title}</h1>
      {children}
    </div>
  );
}
