import { toast } from "sonner";
import { BADGES_BY_ID } from "@/data/achievements";

/** Fires one toast per newly unlocked badge. */
export function celebrateBadges(ids: string[] | undefined) {
  for (const id of ids ?? []) {
    const badge = BADGES_BY_ID[id];
    if (!badge) continue;
    toast.success(`Badge unlocked — ${badge.name}`, { description: badge.description });
  }
}
