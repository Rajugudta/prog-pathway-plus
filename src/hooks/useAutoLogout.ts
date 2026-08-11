import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart", "visibilitychange"] as const;

/**
 * Signs the user out after `minutes` of no interaction. `0` disables it.
 * Keeps a single timer and resets it on any real user activity.
 */
export function useAutoLogout(minutes: number | undefined) {
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!minutes || minutes <= 0) return;
    const ms = minutes * 60 * 1000;

    const logout = async () => {
      await supabase.auth.signOut();
      toast.info(`Signed out after ${minutes} minutes of inactivity.`);
      navigate({ to: "/auth", replace: true });
    };

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void logout(), ms);
    };

    reset();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [minutes, navigate]);
}
