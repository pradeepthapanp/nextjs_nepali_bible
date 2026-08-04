import type { BibleVersion, Commentary } from "../types";

/**
 * Default versions/commentaries shown on first launch. These constants are
 * placeholders matching the Flutter app defaults (New Nepali Revised Version,
 * William MacDonald commentary) and will be reconciled with the backend during
 * migration.
 */

export const DEFAULT_BIBLE_VERSION: BibleVersion = {
  id: "86122184-92c7-4e43-bd34-a3d73f5178a1",
  name: "New Nepali Revised Version",
  tableName: "bible_verses_nnrv_np",
  shortCode: "NNRV",
  title: "New Nepali Revised Version",
  description: "",
  language: "ne",
  isDefault: true,
};

export const DEFAULT_COMMENTARY: Commentary = {
  id: "ddce7262-02b5-422e-95ae-f8aaad39305d",
  name: "विलियम म्याकडोनाल्ड टिप्पणी",
  tableName: "commentaries_wmd_bbc_np",
  shortCode: "WMD_BBC_NP",
  title: "William MacDonald — Believer's Bible Commentary",
  description: "",
};
