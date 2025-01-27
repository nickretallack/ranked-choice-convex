import Loading from "@/components/Loading";
import AllowNominationsCheckbox from "@/components/settings/AllowNominationsCheckbox";
import LiveResultsCheckbox from "@/components/settings/LiveResultsCheckbox";
import PollTitleField from "@/components/settings/PollTitleField";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { BottomBar, MainButton } from "@twa-dev/sdk/react";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

export default function SettingsPageLoader() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const { user } = useUser();
  const navigate = useNavigate();

  if (user?.externalId !== poll.creatorId) {
    void navigate(`/polls/${poll._id}/vote`);
    return <Loading />;
  }
  return <SettingsPage poll={poll} />;
}

export function SettingsPage({ poll }: { poll: Doc<"poll"> }) {
  const formRef = useRef<HTMLFormElement>(null);
  const updateSettings = useMutation(api.poll.updateSettings);
  const [formDirty, setFormDirty] = useState(false);

  const getFormValues = useCallback(() => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    return {
      title: formData.get("title") as string,
      allowNominations: formData.get("allowNominations") === "on",
      liveResults: formData.get("liveResults") === "on",
    };
  }, []);

  const saveHandler = useCallback(() => {
    void (async () => {
      const values = getFormValues()!;
      await updateSettings({
        id: poll._id,
        ...values,
      });
      setFormDirty(false);
    })();
  }, [updateSettings, poll._id, getFormValues]);

  const checkDirty = useCallback(() => {
    const values = getFormValues()!;
    console.log(values);
    if (!values) return false;

    return (
      values.title !== poll.title ||
      values.allowNominations !== poll.allowNominations ||
      values.liveResults !== poll.liveResults
    );
  }, [poll, getFormValues]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleChange = () => {
      setFormDirty(checkDirty());
    };

    form.addEventListener("input", handleChange);
    form.addEventListener("change", handleChange); // For checkboxes
    return () => {
      form.removeEventListener("input", handleChange);
      form.removeEventListener("change", handleChange);
    };
  }, [checkDirty]);

  return (
    <>
      <form ref={formRef} className="form">
        <PollTitleField value={poll.title} />
        <LiveResultsCheckbox value={poll.liveResults} />
        <AllowNominationsCheckbox value={poll.allowNominations} />
      </form>
      <BottomBar>
        {formDirty ? (
          <MainButton text="Save Changes" onClick={saveHandler} />
        ) : (
          <MainButton text="Saved" disabled color="#808080" />
        )}
      </BottomBar>
    </>
  );
}
