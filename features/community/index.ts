/**
 * The Community feature barrel (Prayers + Notices).
 *
 * Exposes every implemented layer: types, constants, utils (deep links, sort,
 * permissions), the SERVICES (data layer), the React Query layer (queries +
 * mutations), the Zustand stores (the two genuinely required UI-only stores),
 * the behavior hooks and the COMPONENTS + pages + the route dispatcher. See
 * `README.md` for the full Flutter → Next mapping + the permission model + the
 * deep-link strategy.
 */

export * from "./types";
export * from "./constants";
export * from "./utils";
export * from "./queries";
export * from "./services";
export * from "./store";
export * from "./hooks";
export * from "./components";
