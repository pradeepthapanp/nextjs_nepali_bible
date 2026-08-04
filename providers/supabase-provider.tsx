"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface SupabaseContextValue {
  /** The browser Supabase client, or `null` until it is created. */
  supabase: SupabaseClient | null;
  /** The current auth session, or `null` when signed out / not loaded yet. */
  session: Session | null;
  /** Whether the initial session check has completed. */
  isLoaded: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

/**
 * Provides the browser Supabase client and keeps the auth session in sync.
 *
 * When Supabase is not configured yet (no env vars), the provider still mounts
 * and simply reports `isLoaded = true` with a `null` client, letting the rest
 * of the app render.
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  // Created once via a lazy useState initializer (the official Supabase
  // pattern). Construction is SSR-safe, and it is guarded by
  // `isSupabaseConfigured` so the app still builds/renders before credentials
  // are supplied — in that case the provider exposes a `null` client and is
  // immediately "loaded".
  const [supabase] = useState<SupabaseClient | null>(() =>
    isSupabaseConfigured ? createClient() : null,
  );
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        setSession(session);
        setIsLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setIsLoaded(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoaded }}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook to access the Supabase context. Must be used inside `<SupabaseProvider>`.
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a <SupabaseProvider>");
  }
  return context;
}
