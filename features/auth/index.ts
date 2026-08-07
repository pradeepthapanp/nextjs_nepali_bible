/**
 * The Authentication feature barrel.
 *
 * Exposes the implemented layers: types (aliases over the shared `Profile` +
 * Supabase `Session`/`User`), constants, utils, services (data layer),
 * queries (React Query), hooks (behavior) and components/pages (the UI). The
 * Zustand stores are documented as CONTRACTS in the folder READMEs and land
 * only if a real shared UI state is discovered. See `README.md` for the full
 * Flutter → Next mapping + the session/OAuth/protected-route strategies.
 */

export * from "./types";
export * from "./constants";
export * from "./utils";
export * from "./services";
export * from "./queries";
export * from "./hooks";
export * from "./components";
