"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LEVELS } from "./levels";
import { initials, useProfile } from "./profile-store";

export function ProfileForm() {
  const { profile, setProfile } = useProfile();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-xl overflow-y-auto px-4 py-10 h-full">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--seal)] uppercase">
        Profil
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Vem lär sig?</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
        Namn och nivå sparas i den här webbläsaren. Nivån du väljer här är den
        som alltid syns i dojon och som skickas med varje fråga.
      </p>

      <div className="mt-8 flex items-center gap-4 rounded-3xl border border-[var(--line)] bg-[var(--paper-raised)] p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--moss)] font-serif text-xl text-[var(--paper-raised)]">
          {initials(profile.name)}
        </span>
        <div>
          <p className="font-serif text-xl">
            {profile.name.trim() || "Gäst"}
          </p>
          <p className="text-sm text-[var(--ink-soft)]">
            {LEVELS.find((item) => item.id === profile.level)?.label}
          </p>
        </div>
      </div>

      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
          window.setTimeout(() => router.push("/"), 700);
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
            Namn
          </span>
          <input
            value={profile.name}
            onChange={(event) => {
              setProfile({ name: event.target.value });
              setSaved(false);
            }}
            placeholder="T.ex. Ernest"
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] px-4 text-sm outline-none focus:border-[var(--seal)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
            Vad vill du bli bättre på?
          </span>
          <input
            value={profile.focus}
            onChange={(event) => {
              setProfile({ focus: event.target.value });
              setSaved(false);
            }}
            placeholder="T.ex. closures, async, DOM"
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] px-4 text-sm outline-none focus:border-[var(--seal)]"
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold tracking-wide uppercase">
            Din nivå
          </legend>
          <div className="grid gap-2">
            {LEVELS.map((level) => {
              const selected = profile.level === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => {
                    setProfile({ level: level.id });
                    setSaved(false);
                  }}
                  className={
                    selected
                      ? "flex items-start justify-between rounded-2xl border border-[var(--seal)] bg-[#f3e2d6] px-4 py-3 text-left"
                      : "flex items-start justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] px-4 py-3 text-left hover:border-[var(--gold)]"
                  }
                >
                  <span>
                    <span className="block font-medium">{level.label}</span>
                    <span className="block text-xs text-[var(--ink-soft)]">
                      {level.hint}
                    </span>
                  </span>
                  {selected ? (
                    <span className="text-xs font-semibold text-[var(--seal)]">
                      Vald
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          className="h-12 rounded-full bg-[var(--ink)] px-6 text-sm font-medium text-[var(--paper-raised)]"
        >
          {saved ? "Sparat i webbläsaren" : "Bekräfta profil"}
        </button>
      </form>
    </div>
  );
}
