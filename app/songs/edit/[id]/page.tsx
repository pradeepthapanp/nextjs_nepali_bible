import { AddEditAudioPage } from "@/features/songs/components/add-edit-audio-page";

/**
 * Edit-audio route (Flutter `/audio_songs/add_edit_audio_song` in edit mode).
 * `{id}` is read by `AddEditAudioPage` via `useParams`. Admin-only.
 */
export default function EditAudioPage() {
  return <AddEditAudioPage />;
}
