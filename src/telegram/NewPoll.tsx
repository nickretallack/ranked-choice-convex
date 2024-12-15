import { useEffect, useRef } from "react";
import Telegram from "@twa-dev/sdk";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

export default function NewPoll() {
  const formRef = useRef<HTMLFormElement>(null);
  // const [candidates, setCandidates] = useState([""]);
  // const [errors, setErrors] = useState<Record<string, string>>({});
  const createPoll = useMutation(api.poll.create);

  useEffect(() => {
    const handler = (async () => {
      const form = formRef.current!;
      const formData = new FormData(form);
      const id = await createPoll({ title: formData.get("title") as string });

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
      </form>
    </div>
  );
}
