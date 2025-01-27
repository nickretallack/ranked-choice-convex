import Telegram from "@twa-dev/sdk";
import { useEffect } from "react";
import { Outlet } from "react-router";

import "./css/button.css";
import "./css/telegram.css";

export default function TelegramTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const colors = Telegram.themeParams;

    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelcase to snake-case
      const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      root.style.setProperty(`--tg-theme-${cssKey}`, value);
    });
  }, []);
  return <Outlet />;
}
