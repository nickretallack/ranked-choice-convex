import CandidateListEditor from "@/components/CandidateListEditor";
import AllowNominationsCheckbox from "@/components/settings/AllowNominationsCheckbox";
import LiveResultsCheckbox from "@/components/settings/LiveResultsCheckbox";
import PollTitleField from "@/components/settings/PollTitleField";
import { api } from "@convex/_generated/api";
import { trimList } from "@convex/util/normalizeWhitespace";
import Telegram from "@twa-dev/sdk";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

export default function NewPoll() {
  const formRef = useRef<HTMLFormElement>(null);
  const [candidates, setCandidates] = useState([""]);
  // const [errors, setErrors] = useState<Record<string, string>>({});
  const createPoll = useMutation(api.telegram.poll.create);

  useEffect(() => {
    const handler = (async () => {
      const form = formRef.current!;
      const formData = new FormData(form);
      const title = formData.get("title") as string;
      const allowNominations = formData.get("allowNominations") === "on";
      const liveResults = formData.get("liveResults") === "on";

      const candidates = trimList(formData.getAll("candidate") as string[]);

      const id = await createPoll({
        title,
        candidates,
        allowNominations,
        liveResults,
      });
      Telegram?.switchInlineQuery(id);
    }) as () => void;

    Telegram.MainButton.show().setText("Create This Poll").onClick(handler);

    return () => {
      Telegram.MainButton.offClick(handler);
    };
  }, [createPoll]);

  return (
    <div>
      <h1>Create a Poll</h1>
      <form ref={formRef}>
        <PollTitleField />
        <LiveResultsCheckbox />

        <h2>Candidates</h2>

        <AllowNominationsCheckbox />

        <CandidateListEditor
          candidates={candidates}
          setCandidates={setCandidates}
        />
      </form>
    </div>
  );
}
