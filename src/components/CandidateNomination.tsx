import { UniqueIdentifier } from "@dnd-kit/core";
import { Candidate, Poll } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import Telegram from "app/telegram.client";
import { useEffect, useRef } from "react";
import { SimpleCandidate } from "~/models/candidate";
import { action } from "~/routes/polls.$pollId.candidates.add";
import { normalizeWhitespace } from "~/utils/normalizeWhitespace";

type Props = {
  pollId: Poll["id"];
  candidateMap: React.MutableRefObject<Map<UniqueIdentifier, SimpleCandidate>>;
  scrollToCandidate: (candidateId: Candidate["id"]) => void;
};

export function CandidateNomination({
  pollId,
  candidateMap,
  scrollToCandidate,
}: Props) {
  const fetcher = useFetcher<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const data = fetcher.data;
    if (fetcher.state !== "idle") return;
    if (!data) return;
    if (data.error) {
      if (Telegram) Telegram.showAlert(data.error);
      else alert(data.error);
    } else if (data.id) {
      formRef.current?.reset();
      scrollToCandidate(data.id);
    }
  }, [fetcher.state, fetcher.data, scrollToCandidate]);

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      action={`/polls/${pollId}/candidates/add`}
      className="candidate-nomination"
      onSubmit={(event) => {
        const name = normalizeWhitespace(
          new FormData(formRef.current!).get("name") as string,
        );

        if (!name) {
          event.preventDefault();
          formRef.current?.reset();
          return;
        }

        const existingCandidateId = Array.from(
          candidateMap.current!.values(),
        ).find((candidate) => candidate.name === name)?.id;

        if (existingCandidateId) {
          event.preventDefault();
          formRef.current?.reset();
          scrollToCandidate(existingCandidateId);
        }
      }}
    >
      <input name="name" placeholder="new candidate..." required />
      <button className="telegram">nominate</button>
    </fetcher.Form>
  );
}
