"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Level } from "./levels";

export type Profile = {
  name: string;
  focus: string;
  level: Level;
};

export type SavedThread = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
  messages: unknown[];
};

const PROFILE_KEY = "js-sensei.profile";
const THREADS_KEY = "js-sensei.threads";
const GREETED_KEY = "js-sensei.greeted";

const DEFAULT_PROFILE: Profile = {
  name: "",
  focus: "",
  level: "beginner",
};

type ProfileContextValue = {
  profile: Profile;
  ready: boolean;
  greeted: boolean;
  threads: SavedThread[];
  activeThreadId: string | null;
  setProfile: (next: Partial<Profile>) => void;
  setLevel: (level: Level) => void;
  saveThread: (thread: SavedThread) => void;
  removeThread: (id: string) => void;
  openThread: (id: string) => void;
  startNewThread: () => void;
  dismissGreeting: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readThreads(): SavedThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedThread => {
      if (!item || typeof item !== "object") return false;
      const row = item as Partial<SavedThread>;
      return typeof row.id === "string" && typeof row.title === "string";
    });
  } catch {
    return [];
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [threads, setThreads] = useState<SavedThread[]>([]);
  const [ready, setReady] = useState(false);
  const [greeted, setGreeted] = useState(true); // true = no modal until we know
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    const stored = readJson<Partial<Profile>>(PROFILE_KEY, {});
    const level =
      stored.level === "student" || stored.level === "developer"
        ? stored.level
        : "beginner";
    setProfileState({
      name: stored.name ?? "",
      focus: stored.focus ?? "",
      level,
    });
    setThreads(readThreads());
    const alreadyGreeted = localStorage.getItem(GREETED_KEY) === "1";
    setGreeted(alreadyGreeted);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    } catch {
      // Quota or private-mode write failure — keep in-memory list.
    }
  }, [threads, ready]);

  const dismissGreeting = useCallback(() => {
    localStorage.setItem(GREETED_KEY, "1");
    setGreeted(true);
  }, []);

  const saveThread = useCallback((thread: SavedThread) => {
    setThreads((prev) =>
      [thread, ...prev.filter((item) => item.id !== thread.id)].slice(0, 12),
    );
  }, []);

  const removeThread = useCallback((id: string) => {
    setThreads((prev) => prev.filter((item) => item.id !== id));
    setActiveThreadId((current) => (current === id ? null : current));
  }, []);

  const openThread = useCallback((id: string) => setActiveThreadId(id), []);
  const startNewThread = useCallback(() => setActiveThreadId(null), []);
  const setProfile = useCallback(
    (next: Partial<Profile>) => setProfileState((prev) => ({ ...prev, ...next })),
    [],
  );
  const setLevel = useCallback(
    (level: Level) => setProfileState((prev) => ({ ...prev, level })),
    [],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      ready,
      greeted,
      threads,
      activeThreadId,
      setProfile,
      setLevel,
      saveThread,
      removeThread,
      openThread,
      startNewThread,
      dismissGreeting,
    }),
    [
      profile,
      ready,
      greeted,
      threads,
      activeThreadId,
      setProfile,
      setLevel,
      saveThread,
      removeThread,
      openThread,
      startNewThread,
      dismissGreeting,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return context;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JS";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
