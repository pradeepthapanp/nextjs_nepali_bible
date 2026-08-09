/**
 * Notes constants — the validation/flow values from the Flutter Notes
 * implementation (`lib/notes/notes_page.dart`, `lib/notes/add_edit_note.dart`,
 * `lib/helpers/enums.dart`, `lib/helpers/constants.dart`). Nothing invented.
 */

/** Note categories (Flutter `NoteCategories` enum, capitalized like the UI). */
export const NOTE_CATEGORIES = [
  "General",
  "Sermon",
  "Prayer",
  "Study",
  "Devotional",
  "Personal",
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

/** Default category (Flutter `NoteCategories.general.name.capitalizeWords()`). */
export const NOTE_DEFAULT_CATEGORY: NoteCategory = "General";

/** Note sort options (Flutter `NotesSort` enum). */
export type NoteSort = "latest" | "oldest" | "alphabetical";

export const NOTE_SORT_OPTIONS: { value: NoteSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "Alphabetical" },
];

/** Note card colours — Flutter `Constants.highlightColors` as hex. */
export const NOTE_COLORS = [
  "#FCD34D",
  "#6EE7B7",
  "#93C5FD",
  "#F9A8D4",
  "#FDBA74",
  "#C4B5FD",
  "#FCA5A5",
  "#A7F3D0",
  "#BFDBFE",
  "#FBCFE8",
  "#FDE68A",
  "#D9F99D",
  "#FED7AA",
  "#E9D5FF",
  "#FECACA",
  "#99F6E4",
  "#CFFAFE",
  "#FEF08A",
  "#86EFAC",
  "#B9E6FE",
] as const;

/** The editor's default note colour (Flutter `Colors.white`). */
export const NOTE_DEFAULT_COLOR = "#ffffff";

/**
 * How `Colors.white.toARGB32()` serializes (4294967295 = 0xFFFFFFFF) — the
 * value the Flutter app stores for a white note, so web-saved colours stay
 * interoperable with the Flutter app's `Color(int.parse(color))`.
 */
export const NOTE_COLOR_STORED_DEFAULT = "4294967295";

/** Storage folder for inline note images (`{folder}/editor/{ts}.{ext}`). */
export const NOTE_IMAGE_UPLOAD_FOLDER = "notes";

/** The notes routes (Flutter `/bible_notes` + `add_edit_notes`). */
export const NOTE_LIST_PATH = "/notes";
export const NOTE_NEW_PATH = "/notes/new";
export const NOTE_EDIT_PATH_PREFIX = "/notes/edit";
