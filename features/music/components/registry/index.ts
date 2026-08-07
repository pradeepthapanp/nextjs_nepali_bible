"use client";

import { setDefaultLyricsRenderer } from "../context/lyrics-render-context";
import { createLyricsRendererRegistry } from "./lyrics-registry";

// Install the default registry once at module load so lyric components work
// standalone (showChords on, no chord-tap) — mirroring the Bible module.
setDefaultLyricsRenderer(createLyricsRendererRegistry());

export * from "./lyrics-registry";
