import Loading from "@/components/Loading";
import PollNav from "@/components/PollNav";
import PollPage from "@/components/PollPage";
import AllowNominationsCheckbox from "@/components/settings/AllowNominationsCheckbox";
import LiveResultsCheckbox from "@/components/settings/LiveResultsCheckbox";
import PollTitleField from "@/components/settings/PollTitleField";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import Telegram from "@twa-dev/sdk";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";

export default function SettingsPageLoader() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const { user } = useUser();
  const navigate = useNavigate();

  if (user?.externalId !== poll.creatorId) {
    void navigate(`/polls/${poll._id}/vote`);
    return <Loading />;
  }
  return <SettingsPage poll={poll} user={user} />;
}

export function SettingsPage({
  poll,
  user,
}: {
  poll: Doc<"poll">;
  user: ReturnType<typeof useUser>["user"];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const updateSettings = useMutation(api.poll.updateSettings);

  useEffect(() => {
    const saveHandler = (async () => {
      const form = formRef.current!;
      const formData = new FormData(form);

      const title = formData.get("title") as string;
      const allowNominations = formData.get("allowNominations") === "on";
      const liveResults = formData.get("liveResults") === "on";
      await updateSettings({
        id: poll._id,
        title,
        allowNominations,
        liveResults,
      });
    }) as () => void;

    Telegram.MainButton.show().setText("Save Changes").onClick(saveHandler);

    return () => {
      Telegram.MainButton.offClick(saveHandler).hide();
    };
  }, [updateSettings, poll._id]);

  return (
    <PollPage poll={poll}>
      <div className="main-section">
        <PollNav poll={poll} userId={user?.externalId} />
        <form ref={formRef} className="settings-form">
          <PollTitleField value={poll.title} />
          <AllowNominationsCheckbox value={poll.allowNominations} />
          <LiveResultsCheckbox value={poll.liveResults} />
        </form>
      </div>
    </PollPage>
  );
}
