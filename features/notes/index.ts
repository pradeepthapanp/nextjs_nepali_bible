/**
 * The Notes feature barrel.
 *
 * Exposes the implemented layers: types, constants, utils, services, queries,
 * stores, behavior hooks and the Quill-free reusable component library. The
 * Quill editor (`note-editor`) and the page orchestrators are deep-imported by
 * their routes (client-only, lazy-loaded) so Quill never enters the server
 * bundle. See `README.md` for the full Flutter → Next mapping.
 */
export * from "./types";
export * from "./constants";
export * from "./utils";
export * from "./services";
export * from "./queries";
export * from "./store";
export * from "./hooks";
export * from "./components";
