import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * Dev-only: allow the app to be served from non-localhost origins. Next's
   * dev server blocks `_next` assets/HMR from unknown hosts by default
   * (DNS-rebinding protection). These allow:
   *   - any Cloudflare quick tunnel (https://xxx.trycloudflare.com)
   *   - the machine's LAN address (http://192.168.1.64:3000) for devices on
   *     the same Wi-Fi network
   * Has no effect on production builds.
   */
  allowedDevOrigins: ["**.trycloudflare.com", "192.168.1.64"],
};

export default withNextIntl(nextConfig);
