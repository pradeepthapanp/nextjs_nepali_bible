"use client";

import { BookOpen, FileText, Flame } from "lucide-react";
import { ReaderSettingsPanel, ReaderSettingsProvider } from "@components/reader";
import { useReaderSettings } from "@features/bible/store";
import { useArticleReaderSettings } from "@features/articles/hooks";
import { useDevotionReaderSettings } from "@features/devotions/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingRow, ToggleSwitch } from "./settings-controls";

/**
 * ReadingSection — the Settings → Reading section.
 *
 * COMPOSES the existing per-feature reader-settings stores (it does NOT create
 * another reader store): Bible (`bible.reader-settings`), Articles
 * (`articles.reader-settings`) and Devotions (`devotions.reader-settings`).
 * Each surface supplies its persisted value to the SHARED `ReaderSettingsPanel`
 * via `ReaderSettingsProvider`, and the Bible card additionally edits its
 * display toggles. The page simply edits them — the stores remain the single
 * source of truth for their own reading surface.
 */
export function ReadingSection() {
  const bible = useReaderSettings();
  const article = useArticleReaderSettings();
  const devotion = useDevotionReaderSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Reading</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Font and layout preferences for each reading surface. Changes apply
          instantly and are saved on this device.
        </p>
      </div>

      {/* Bible */}
      <section aria-label="Bible reading settings">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="size-4 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Bible</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ReaderSettingsProvider value={bible}>
            <ReaderSettingsPanel />
          </ReaderSettingsProvider>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <SettingRow title="Red letters" description="Highlight the words of Jesus.">
                <ToggleSwitch
                  checked={bible.redLetters}
                  onChange={bible.setRedLetters}
                  label="Red letters"
                />
              </SettingRow>
              <SettingRow title="Comments" description="Show commentary notes.">
                <ToggleSwitch
                  checked={bible.showComments}
                  onChange={bible.setShowComments}
                  label="Comments"
                />
              </SettingRow>
              <SettingRow title="References" description="Show cross-references.">
                <ToggleSwitch
                  checked={bible.showCrossReferences}
                  onChange={bible.setShowCrossReferences}
                  label="References"
                />
              </SettingRow>
              <SettingRow title="Verse numbers" description="Show verse numbers in the text.">
                <ToggleSwitch
                  checked={bible.showVerseNumbers}
                  onChange={bible.setShowVerseNumbers}
                  label="Verse numbers"
                />
              </SettingRow>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Articles */}
      <section aria-label="Article reading settings">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="size-4 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Articles</h3>
        </div>
        <ReaderSettingsProvider value={article}>
          <ReaderSettingsPanel />
        </ReaderSettingsProvider>
      </section>

      {/* Devotions */}
      <section aria-label="Devotion reading settings">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="size-4 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Devotions</h3>
        </div>
        <ReaderSettingsProvider value={devotion}>
          <ReaderSettingsPanel />
        </ReaderSettingsProvider>
      </section>
    </div>
  );
}
