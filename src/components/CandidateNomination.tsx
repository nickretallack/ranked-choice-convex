import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { normalizeWhitespace } from "@convex/shared/normalizeWhitespace";
import { UniqueIdentifier } from "@dnd-kit/core";
import Telegram from "@twa-dev/sdk";
import { useMutation } from "convex/react";
import { useRef } from "react";

type Props = {
  pollId: Id<"poll">;
  candidateMap: React.MutableRefObject<Map<UniqueIdentifier, Doc<"candidate">>>;
  scrollToCandidate: (candidateId: Id<"candidate">) => void;
};

export function CandidateNomination({
  pollId,
  candidateMap,
  scrollToCandidate,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const nominate = useMutation(api.candidate.nominate);

  return (
    <form
      ref={formRef}
      method="post"
      action={`/polls/${pollId}/candidates/add`}
      className="candidate-nomination"
      onSubmit={(event) => {
        event.preventDefault();
        const name = normalizeWhitespace(
          new FormData(formRef.current!).get("name") as string,
        );

        if (!name) {
          formRef.current?.reset();
          return;
        }

        const existingCandidateId = Array.from(
          candidateMap.current.values(),
        ).find(
          (candidate) => candidate.name.toLowerCase() === name.toLowerCase(),
        )?._id;

        if (existingCandidateId) {
          formRef.current?.reset();
          scrollToCandidate(existingCandidateId);
        } else {
          nominate({
            pollId,
            name,
            telegramInitData: Telegram.initData,
          }).then(
            (candidateId) => {
              formRef.current?.reset();
              scrollToCandidate(candidateId);
            },
            (error) => Telegram.showAlert(error),
          );
        }
      }}
    >
      <div className="panel actionable-input">
        <input
          name="name"
          className="text-input"
          placeholder="new candidate..."
          required
        />
        <button>nominate</button>
      </div>
    </form>
  );
}
