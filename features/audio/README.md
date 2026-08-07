# Shared Audio Player Platform (implemented)

A feature-agnostic playback layer reused by **Online Songs**, the **Audio Bible**
and future **Podcasts**. It knows NOTHING about Songs, Bible chapters or
episodes — it only plays a generic [`AudioItem`](types/audio-item.ts). Consumers
map their own models into `AudioItem`s and call `playQueue([...])`.

## What it replaces (Flutter)

| Web platform piece | Flutter class |
| --- | --- |
| `services/audio-engine.ts` (`AudioEngine`) | `just_audio` `AudioPlayer` + `AudioController` (`lib/providers/audio/audio_controller_provider.dart`) — queue (ConcatenatingAudioSource), play/pause/stop, seekToNext/Previous, setSpeed, shuffle, LoopMode |
| `services/media-session.ts` | `just_audio_background` + `AudioSession.configure(music)` — lock-screen/OS media metadata + transport actions |
| `services/index.ts` `getAudioEngine()` | `audioPlayerProvider` (the single shared `AudioPlayer`) |
| `store/audio-player-store.ts` | the derived `StreamProvider`s in `lib/providers/audio/stream_providers.dart` (position/duration/speed/shuffle/sequence/processing) |
| `hooks/use-audio-player.ts` | the `AudioController` consumption surface (all actions + derived labels) |
| `components/audio-artwork.tsx` | `ArtworkWidget` (`lib/audios/widgets/audio_image_widget.dart`) |
| `components/progress-line.tsx` | the `LinearProgressIndicator` atop `MiniAudioPlayer` |
| `components/seek-bar.tsx` | the `Slider` in `_FullAudioPlayerSheet` / `FullAudioBiblePlayer` |
| `components/playback-speed-select.tsx` | `PlaybackSpeedPopupWidget` (0.75–2.0x) |
| `components/mini-audio-player.tsx` | `MiniAudioPlayer` (`lib/audios/widgets/mini_audio_player.dart`) |
| `components/full-audio-player.tsx` | `FullAudioPlayer` / `_FullAudioPlayerSheet` (modal bottom sheet) |
| `components/audio-player-host.tsx` | the app-wide wiring of `audioPlayerProvider` + `just_audio_background` + the global playback keys |
| `types/audio-item.ts` | `MediaItem` tags built by `Audio.toAudioSource()` / `BibleAudio.toAudioSource()` (`audio_mapper.dart`) |

## Capabilities

- **play / pause / stop** — stop also clears the queue + current item (like the
  Flutter `AudioController.stop()`).
- **queue** — `playQueue(items, startIndex)` loads a list (web
  `ConcatenatingAudioSource`); the Full player lists it and `playAtIndex`.
- **previous / next** — `previous()` restarts the current item after 3s
  (`just_audio.seekToPrevious` semantics); `next()` wraps when repeat-all.
- **shuffle** — a randomized play order (current item first); `toggleShuffle`.
- **repeat** — `off | all | one` (`cycleRepeat`); repeat-one replays on `ended`.
- **playback speed** — `setSpeed` (0.75–2.0x).
- **seek + progress** — `seek(seconds)`, position/duration/buffered streamed
  from the `<audio>` element (~4×/s), `formatTime`/`formatRemaining`/`progressFraction`.
- **current item** — `currentItem` + `currentIndex` + `queue`.
- **MiniAudioPlayer** — fixed bottom bar (progress line, artwork, title/artist,
  remaining time, speed, prev/play/next/stop); tapping opens the full player.
- **FullAudioPlayer** — dialog with artwork, seek bar, transport, shuffle /
  repeat / speed / stop, and the queue list.
- **Media Session API** — metadata + playbackState + positionState + system
  play/pause/prev/next/seek/stop handlers.
- **keyboard shortcuts** — Space (play/pause), ←/→ (seek ±10s), n/p (next/prev);
  ignored in form controls and while a dialog is open.
- **responsive** — the mini bar wraps/shrinks on small screens (speed hides
  below `md`); the full player is a bottom sheet on mobile, centered on `sm+`.

## Usage

```tsx
// Mount once (feature shell / layout):
<AudioPlayerHost />

// Anywhere — start playback with a feature model mapped to AudioItems:
const { playQueue } = useAudioPlayer();
playQueue(
  songs.map((song) => ({
    id: song.id,
    title: song.name ?? "Song",
    artist: song.artist,
    audioUrl: song.audioUrl,
    artworkUrl: song.artUrl,
    meta: { songId: song.id },
  })),
  0,
);
```

## Architecture notes

- **Engine-first**: `AudioEngine` is a framework-free, DOM-guarded singleton
  (no `<audio>` on the server) owning the media element + queue semantics. The
  Zustand `useAudioPlayerStore` is only the reactive projection; components
  subscribe to individual fields so the seek bar updates ~4×/s without
  re-rendering the whole tree.
- **Generic by contract**: `AudioItem` carries opaque `meta` for consumers; the
  platform never reads it.
- Not built here (later features): Online Songs, Audio Bible, Podcasts,
  `AudioListPage`, `AddEditAudioPage`, uploads / Supabase audio services.
