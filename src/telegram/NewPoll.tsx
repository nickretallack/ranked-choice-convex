import CandidateListEditor from "@/components/CandidateListEditor";
import AllowNominationsCheckbox from "@/components/settings/AllowNominationsCheckbox";
import LiveResultsCheckbox from "@/components/settings/LiveResultsCheckbox";
import PollTitleField from "@/components/settings/PollTitleField";
import { api } from "@convex/_generated/api";
import { trimList } from "@convex/shared/normalizeWhitespace";
import Telegram from "@twa-dev/sdk";
import { BottomBar, MainButton } from "@twa-dev/sdk/react";
import { useMutation } from "convex/react";
import { useCallback, useRef, useState } from "react";

export default function NewPoll() {
  const formRef = useRef<HTMLFormElement>(null);
  const [candidates, setCandidates] = useState(["", ""]);
  const createPoll = useMutation(api.telegram.poll.create);
  const submitHandler = useCallback(() => {
    void (async () => {
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
      Telegram.switchInlineQuery(id);
    })();
  }, [createPoll]);

  return (
    <div className="container">
      <form ref={formRef} className="form">
        <h1>New Poll</h1>
        <PollTitleField />
        <LiveResultsCheckbox />
        <AllowNominationsCheckbox />

        <CandidateListEditor
          candidates={candidates}
          setCandidates={setCandidates}
        />
      </form>
      <BottomBar>
        <MainButton text="Create This Poll" onClick={submitHandler} />
      </BottomBar>
    </div>
  );
}
