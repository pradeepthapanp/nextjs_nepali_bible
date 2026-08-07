/**
 * Editor constants — direct ports of `AddEditArticlePage` + `UploadNotifier`.
 */
/** Storage folder for featured-image uploads (`articles/{timestamp}.{ext}`). */
export const ARTICLE_IMAGE_UPLOAD_FOLDER = "articles";

/** ImagePicker tuning in `_pickImage` (imageQuality 85, max 1600×1600). */
export const ARTICLE_IMAGE_MAX_DIMENSION = 1600;
export const ARTICLE_IMAGE_QUALITY = 85;

/** Featured-image fallback when none is set (Flutter `church_placeholder.png`). */
export const ARTICLE_FEATURED_IMAGE_FALLBACK =
  "https://api.sgmbiblezone.com/storage/v1/object/public/resources/church_placeholder.png";

/**
 * The Quill toolbar attribute set Flutter exposes via `QuillSimpleToolbar`
 * (`_buildToolbar` in `add_edit_article_page.dart`). The web Quill.js toolbar
 * must expose the SAME attributes so edits round-trip identically. The
 * "advanced" flags map to Flutter's `_showAdvancedToolbar` toggle.
 */
export const QUILL_TOOLBAR_BASIC = ["bold", "italic", "underline", "list:bullet", "undo", "redo"] as const;
export const QUILL_TOOLBAR_ADVANCED = [
  "strike",
  "code-block",
  "header",
  "list:ordered",
  "list:check",
  "align",
  "indent",
  "link",
  "blockquote",
  "color",
  "background",
  "clear",
  "font",
  "size",
] as const;
