"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBell,
  faBookBible,
  faBookOpenReader,
  faBullhorn,
  faCircleInfo,
  faGear,
  faGraduationCap,
  faHandsPraying,
  faHeadphones,
  faHouse,
  faList,
  faLock,
  faMagnifyingGlass,
  faMapLocationDot,
  faMusic,
  faNewspaper,
  faPalette,
  faPeopleGroup,
  faScroll,
  faSun,
  faUser,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/utils/cn";

/**
 * FeatureIcons — the SINGLE shared registry of feature icons for the app.
 *
 * Every feature / navigation icon must come from here (Font Awesome), so
 * feature icons are never scattered across the project. Lucide remains for
 * GENERIC UI controls (arrows, chevrons, spinners, close, heart/favorite,
 * trash, etc.) — it is intentionally NOT replaced globally.
 *
 * Icons are sized via `font-size` (Font Awesome renders at 1em), so the
 * default here is `text-xl` (20px — matching the old Lucide `size-5`); pass a
 * smaller `text-*` class (e.g. `text-base`) for compact spots.
 */

export const featureIcons = {
  home: faHouse,
  bible: faBookBible,
  music: faMusic,
  playlists: faList,
  articles: faNewspaper,
  devotions: faSun,
  maps: faMapLocationDot,
  community: faPeopleGroup,
  prayers: faHandsPraying,
  notices: faBullhorn,
  quiz: faGraduationCap,
  settings: faGear,
  profile: faUser,
  account: faUserGear,
  appearance: faPalette,
  reading: faBookOpenReader,
  audio: faHeadphones,
  notifications: faBell,
  about: faCircleInfo,
  privacy: faLock,
  licenses: faScroll,
  search: faMagnifyingGlass,
} satisfies Record<string, IconDefinition>;

export type FeatureIconName = keyof typeof featureIcons;

export interface FeatureIconProps {
  name: FeatureIconName;
  className?: string;
  /** Decorative icons are hidden from assistive tech by default. */
  "aria-hidden"?: boolean;
}

/** Renders a Font Awesome feature icon from the shared registry. */
export function FeatureIcon({
  name,
  className,
  "aria-hidden": ariaHidden = true,
}: FeatureIconProps) {
  return (
    <FontAwesomeIcon
      icon={featureIcons[name]}
      aria-hidden={ariaHidden}
      className={cn("text-xl leading-none", className)}
    />
  );
}
