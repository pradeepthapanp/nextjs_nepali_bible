/**
 * The Devotions feature barrel.
 *
 * Exposes every implemented layer: types, constants, the pure utils
 * (day-of-year, date, bible-link, deep-link, plain-text), the SERVICES (the
 * data layer — `DevotionService` + the aggregate), the React Query layer
 * (`devotionKeys` + `useDailyDevotion`), the persisted reader-settings store,
 * the behavior hooks and the components + the page orchestrator. See
 * `README.md` for the full Flutter → Next mapping + the routes / deep links /
 * permissions + the verified backend schema.
 */

export * from "./types";
export * from "./constants";
export * from "./utils";
export * from "./queries";
export * from "./services";
export * from "./store";
export * from "./hooks";
export * from "./components";
