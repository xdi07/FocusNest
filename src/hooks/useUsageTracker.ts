import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TICK_MS = 60_000; // 1 minute
const FLUSH_MS = 5 * 60_000; // 5 minutes

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const storageKey = (userId: string) => `focusnest:usage:${userId}`;

interface StoredUsage {
  date: string;
  minutes: number;
}

const readStored = (userId: string): StoredUsage => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as StoredUsage;
      if (parsed.date === todayStr()) return parsed;
    }
  } catch {}
  return { date: todayStr(), minutes: 0 };
};

const writeStored = (userId: string, value: StoredUsage) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(value));
  } catch {}
};

/**
 * Tracks how many minutes the user has actively spent in the app today.
 * Increments only while the tab is visible. Persists to localStorage
 * every minute and to Supabase every 5 minutes / on visibility change.
 */
export const useUsageTracker = () => {
  const { user, settings, updateSettings } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const minutesRef = useRef(0);
  const lastFlushRef = useRef(Date.now());

  // Hydrate from localStorage / settings once user is available
  useEffect(() => {
    if (!user) return;
    const stored = readStored(user.id);
    let initial = stored.minutes;

    // If settings has a fresher value for today, use that
    if (
      settings?.last_usage_date === todayStr() &&
      typeof settings.daily_usage_minutes === "number" &&
      settings.daily_usage_minutes > initial
    ) {
      initial = settings.daily_usage_minutes;
    }

    minutesRef.current = initial;
    setMinutes(initial);
    writeStored(user.id, { date: todayStr(), minutes: initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, settings?.last_usage_date]);

  // Tick every minute while visible
  useEffect(() => {
    if (!user) return;

    const flush = async () => {
      lastFlushRef.current = Date.now();
      try {
        await updateSettings({
          daily_usage_minutes: minutesRef.current,
          last_usage_date: todayStr(),
        });
      } catch (err) {
        console.warn("Failed to flush usage:", err);
      }
    };

    const tick = () => {
      if (document.visibilityState !== "visible") return;

      // Date rollover
      const stored = readStored(user.id);
      if (stored.date !== todayStr()) {
        minutesRef.current = 0;
      }

      minutesRef.current += 1;
      setMinutes(minutesRef.current);
      writeStored(user.id, { date: todayStr(), minutes: minutesRef.current });

      if (Date.now() - lastFlushRef.current >= FLUSH_MS) {
        flush();
      }
    };

    const interval = setInterval(tick, TICK_MS);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { minutes };
};