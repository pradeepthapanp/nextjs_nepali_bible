import { TodaysDevotionPage } from "@/features/devotions/components/todays-devotion-page";

/**
 * Devotion route — the Today's Devotion page (PUBLIC, single route).
 *
 * A thin server shell mounting the client page. Because there is exactly ONE
 * devotion route, no catch-all and no route dispatcher are required (unlike
 * Maps/Articles/Music/Community). The page reads its own data/deep links.
 */
export default function DevotionPage() {
  return <TodaysDevotionPage />;
}
