import { HomePage } from "@/app/_components/home/home-page";

/**
 * Root route — the public landing page. Server shell that renders the
 * client `HomePage` (hero, quick access, today's devotion, recent
 * articles, featured music, community and footer).
 */
export default function Home() {
  return <HomePage />;
}

