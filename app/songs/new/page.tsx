import { AddEditAudioPage } from "@/features/songs/components/add-edit-audio-page";

/**
 * Create-audio route (Flutter `/audio_songs/add_edit_audio_song` in create
 * mode). Admin-only — the page gates itself on the current user's role.
 */
export default function NewAudioPage() {
  return <AddEditAudioPage />;
}
