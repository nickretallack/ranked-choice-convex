import Loading from "@/components/Loading";
import PollNav from "@/components/PollNav";
import PollPage from "@/components/PollPage";
import AllowNominationsCheckbox from "@/components/settings/AllowNominationsCheckbox";
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
    const handler = (async () => {
      const form = formRef.current!;
      const formData = new FormData(form);

      const title = formData.get("title") as string;
      const allowNominations = formData.get("allowNominations") === "on";

      await updateSettings({ id: poll._id, title, allowNominations });
    }) as () => void;

    Telegram.MainButton.show().setText("Save Changes").onClick(handler);

    return () => {
      Telegram.MainButton.offClick(handler).hide();
    };
  }, [updateSettings, poll._id]);

  return (
    <PollPage poll={poll}>
      <div className="main-section">
        <PollNav poll={poll} personId={user?.externalId} />
        <form ref={formRef} className="settings-form">
          <PollTitleField value={poll.title} />
          <AllowNominationsCheckbox value={poll.allowNominations} />
        </form>
      </div>
    </PollPage>
  );
}
