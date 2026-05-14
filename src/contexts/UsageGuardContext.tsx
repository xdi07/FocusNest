import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageTracker } from "@/hooks/useUsageTracker";
import OveruseLimitModal from "@/components/overuse/OveruseLimitModal";
import OveruseBanner from "@/components/overuse/OveruseBanner";
import OveruseDimOverlay from "@/components/overuse/OveruseDimOverlay";

export type UsageStage = "ok" | "approaching" | "atLimit" | "overuse";

interface UsageGuardContextValue {
  minutes: number;
  limit: number;
  stage: UsageStage;
  bannerDismissed: boolean;
  dismissBanner: () => void;
}

const UsageGuardContext = createContext<UsageGuardContextValue | undefined>(undefined);

const NUDGE_INTERVAL_MS = 5 * 60_000;
const BANNER_REAPPEAR_MS = 10 * 60_000;

export const UsageGuardProvider = ({ children }: { children: ReactNode }) => {
  const { user, settings } = useAuth();
  const { minutes } = useUsageTracker();
  const location = useLocation();

  const limit = settings?.daily_limit_minutes ?? 120;

  const stage: UsageStage = useMemo(() => {
    if (!limit || limit <= 0) return "ok";
    const ratio = minutes / limit;
    if (ratio >= 1.2) return "overuse";
    if (ratio >= 1) return "atLimit";
    if (ratio >= 0.8) return "approaching";
    return "ok";
  }, [minutes, limit]);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const lastStageRef = useRef<UsageStage>("ok");
  const lastNudgeRef = useRef(0);

  // Routes where the guard should NOT render (admin pages, auth, onboarding)
  const isExcludedRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/auth") ||
    location.pathname === "/";

  // Stage transitions
  useEffect(() => {
    if (!user || isExcludedRoute) return;
    const prev = lastStageRef.current;
    if (stage === prev) return;

    if (stage === "approaching" && prev === "ok") {
      toast.message("You're close to your daily limit", {
        description: "Consider taking a break soon.",
      });
    }
    if (stage === "atLimit" && prev !== "atLimit" && prev !== "overuse") {
      setShowLimitModal(true);
    }
    if (stage === "overuse" && prev !== "overuse") {
      toast.warning("You've gone past your daily app limit", {
        description: "Try stepping away for a few minutes.",
      });
      setBannerDismissed(false);
    }

    lastStageRef.current = stage;
  }, [stage, user, isExcludedRoute]);

  // Periodic nudge during overuse
  useEffect(() => {
    if (stage !== "overuse" || isExcludedRoute) return;
    const id = setInterval(() => {
      if (Date.now() - lastNudgeRef.current >= NUDGE_INTERVAL_MS) {
        lastNudgeRef.current = Date.now();
        toast.message("Still here? Time for a real break 🌿");
      }
    }, NUDGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [stage, isExcludedRoute]);

  // Banner re-appear
  useEffect(() => {
    if (!bannerDismissed) return;
    const id = setTimeout(() => setBannerDismissed(false), BANNER_REAPPEAR_MS);
    return () => clearTimeout(id);
  }, [bannerDismissed]);

  const value = useMemo(
    () => ({
      minutes,
      limit,
      stage,
      bannerDismissed,
      dismissBanner: () => setBannerDismissed(true),
    }),
    [minutes, limit, stage, bannerDismissed],
  );

  return (
    <UsageGuardContext.Provider value={value}>
      {children}
      {!isExcludedRoute && (
        <>
          {stage === "overuse" && !bannerDismissed && <OveruseBanner />}
          {stage === "overuse" && <OveruseDimOverlay />}
          <OveruseLimitModal
            open={showLimitModal}
            minutes={minutes}
            limit={limit}
            onClose={() => setShowLimitModal(false)}
          />
        </>
      )}
    </UsageGuardContext.Provider>
  );
};

export const useUsageGuard = () => {
  const ctx = useContext(UsageGuardContext);
  if (!ctx) {
    return {
      minutes: 0,
      limit: 120,
      stage: "ok" as UsageStage,
      bannerDismissed: false,
      dismissBanner: () => {},
    };
  }
  return ctx;
};