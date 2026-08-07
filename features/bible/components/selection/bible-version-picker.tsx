"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useBibleNavigation } from "../../hooks";
import { useBibles } from "../../queries";
import { useReadingStore } from "../../store";
import type { BibleVersion } from "../../types";

/**
 * BibleVersionPicker — a reusable dropdown for choosing the Bible version.
 *
 * Replaces the Flutter `BibleSelectionPopupButton`
 * (`lib/bible/widgets/popups/bible_selection_popup.dart`) and
 * `BibleSelectionDropdown` (`lib/global/widgets/dropdowns/bible_selection_dropdown.dart`),
 * which rendered a version dropdown bound to `settings.bible`.
 *
 * Smart defaults: reads the version list from `useBibles()` and the current
 * selection from the reading store, and switches via `useBibleNavigation`
 * (store + URL `?v=` + recent versions). Callers may override `versions`,
 * `value` and `onVersionChange` to make it fully controlled/reusable.
 */

export interface BibleVersionPickerProps {
  /** Version list; defaults to `useBibles()`. */
  versions?: BibleVersion[];
  /** Selected version id; defaults to the reading store. */
  value?: string;
  /** Custom change handler; defaults to `useBibleNavigation.goToVersion`. */
  onVersionChange?: (versionId: string) => void;
  className?: string;
}

export function BibleVersionPicker({
  versions,
  value,
  onVersionChange,
  className,
}: BibleVersionPickerProps) {
  const { data: fetchedVersions } = useBibles();
  const storeVersionId = useReadingStore((state) => state.versionId);
  const { goToVersion } = useBibleNavigation();

  const list = versions ?? fetchedVersions;
  const selectedId = value ?? storeVersionId;

  const handleChange = (versionId: string) => {
    if (onVersionChange) {
      onVersionChange(versionId);
      return;
    }
    goToVersion(versionId);
  };

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="bible-version-picker" className="sr-only">
        Bible version
      </label>
      <div className="relative">
        <select
          id="bible-version-picker"
          value={selectedId}
          onChange={(event) => handleChange(event.target.value)}
          className="h-10 w-full appearance-none truncate rounded-lg border border-input bg-transparent pl-3 pr-9 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {(list ?? []).map((version) => (
            <option key={version.id} value={version.id}>
              {version.shortCode} — {version.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}
