import CandidateListEditor from "@/components/CandidateListEditor";
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
      const candidates = trimList(formData.getAll("candidate") as string[]);
      const allowNominations = formData.get("allowNominations") === "on";

      const id = await createPoll({ title, candidates, allowNominations });
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
        <div className="form-control">
          <label htmlFor="title">Title</label>
          <input
            name="title"
            id="title"
            // defaultValue={poll?.title}
            required
            // aria-invalid={errors?.title ? "true" : "false"}
          />
          {/* {errors?.title && <p className="error">{errors.title}</p>} */}
        </div>

        <h2>Candidates</h2>

        <div className="control">
          <label htmlFor="allowNominations">
            <input
              name="allowNominations"
              type="checkbox"
              id="allowNominations"
              defaultChecked={false}
            />
            Allow voters to nominate new candidates.
          </label>
        </div>

        <CandidateListEditor
          candidates={candidates}
          setCandidates={setCandidates}
        />
      </form>
    </div>
  );
}
