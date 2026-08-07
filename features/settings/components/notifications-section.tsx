"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingRow, ToggleSwitch } from "./settings-controls";

/** Notification preference keys (UI-only; no backend push infra yet). */
const NOTIFICATION_ITEMS = [
  {
    id: "dailyDevotion",
    title: "Daily Devotion",
    description: "A new devotion and verse every morning.",
  },
  {
    id: "articles",
    title: "Articles",
    description: "New articles and teachings from the community.",
  },
  {
    id: "prayerReplies",
    title: "Prayer replies",
    description: "When someone responds to your prayer request.",
  },
  {
    id: "notices",
    title: "Notices",
    description: "Church and community notices and announcements.",
  },
] as const;

type NotificationPrefs = Record<(typeof NOTIFICATION_ITEMS)[number]["id"], boolean>;

const DEFAULT_PREFS: NotificationPrefs = {
  dailyDevotion: true,
  articles: true,
  prayerReplies: true,
  notices: true,
};

const STORAGE_KEY = "notifications.prefs";

function readPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * NotificationsSection — the Settings → Notifications section.
 *
 * There is no notification infrastructure in the web app yet (verified — only
 * the media-session audio wiring exists), so this builds the preferences UI
 * only: four toggles persisted to localStorage on this device. When a real
 * push / in-app notification system lands, this store/UI becomes the
 * source of truth for the user's choices.
 */
export function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(readPrefs);

  const update = (id: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [id]: value };
    setPrefs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode) — keep the in-memory value.
    }
  };

  const anyEnabled = Object.values(prefs).some(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Choose what you would like to be notified about. Preferences are
          saved on this device.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {anyEnabled ? (
              <Bell className="size-4 text-primary" aria-hidden />
            ) : (
              <BellOff className="size-4 text-muted-foreground" aria-hidden />
            )}
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {NOTIFICATION_ITEMS.map((item) => (
            <SettingRow
              key={item.id}
              title={item.title}
              description={item.description}
            >
              <ToggleSwitch
                checked={prefs[item.id]}
                onChange={(value) => update(item.id, value)}
                label={item.title}
              />
            </SettingRow>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Notifications are not sent yet — these are your saved preferences for
        when notification delivery becomes available.
      </p>
    </div>
  );
}
