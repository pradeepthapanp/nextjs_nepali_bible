import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Web app manifest (PWA metadata) served at `/manifest.webmanifest`. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/logo/app-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/app-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
