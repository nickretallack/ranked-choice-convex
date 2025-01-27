import Loading from "@/components/Loading";
import PollPage from "@/components/PollPage";
import AllowNominationsCheckbox from "@/components/settings/AllowNominationsCheckbox";
import LiveResultsCheckbox from "@/components/settings/LiveResultsCheckbox";
import PollTitleField from "@/components/settings/PollTitleField";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { BottomBar, MainButton } from "@twa-dev/sdk/react";
import { useMutation } from "convex/react";
import { useCallback, useRef } from "react";
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
  const saveHandler = useCallback(() => {
    void (async () => {
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
    })();
  }, [updateSettings, poll._id]);

  return (
    <PollPage poll={poll}>
      <div className="container">
        <form ref={formRef} className="form">
          <PollTitleField value={poll.title} />
          <LiveResultsCheckbox value={poll.liveResults} />
          <AllowNominationsCheckbox value={poll.allowNominations} />
        </form>
      </div>
      <BottomBar>
        <MainButton text="Save Changes" onClick={saveHandler} />
      </BottomBar>
    </PollPage>
  );
}
