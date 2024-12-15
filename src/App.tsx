import { Chat } from "@/Chat/Chat";
import { ChatIntro } from "@/Chat/ChatIntro";
import { randomName } from "@/Chat/randomName";
import { Layout } from "@/Layout";
import { UserMenu } from "@/components/UserMenu";
import { useEffect, useState } from "react";
import Telegram from "@twa-dev/sdk";
import { api } from "../convex/_generated/api";
import { useAction } from "convex/react";

export default function App() {
  const [viewer] = useState(randomName());

  const validateUser = useAction(api.telegram.actions.validateUser);
  useEffect(() => {
    validateUser({ initData: Telegram.initData }).then(
      (isValid) => {
        if (!isValid) {
          console.log("User is invalid");
        }
      },
      (error) => {
        console.error("Error validating user:", error);
      },
    );
    return () => {};
  }, [validateUser]);

  return (
    <Layout menu={<UserMenu>{viewer}</UserMenu>}>
      <ChatIntro />
      <Chat viewer={viewer} />
    </Layout>
  );
}
