"use client";

import { COPY } from "./copy";
import { useProfile } from "./profile-store";

export function EmptyState({
  onPickSuggestion,
}: {
  onPickSuggestion: (text: string) => void;
}) {
  const { profile } = useProfile();
  const name = profile.name.trim();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--paper-raised)] font-serif text-2xl text-[var(--seal)] shadow-[0_10px_30px_rgba(122,45,18,0.08)]">
        師
      </div>
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--seal)] uppercase">
        {name ? `Välkommen, ${name}` : "Dojo"}
      </p>
      <h2 className="mt-2 font-serif text-3xl tracking-tight text-[var(--ink)]">
        {COPY.emptyTitle}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
        {COPY.emptyBody}
      </p>
      <ul className="mt-7 flex flex-wrap justify-center gap-2">
        {COPY.suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onPickSuggestion(suggestion)}
              className="rounded-full border border-[var(--line)] bg-[var(--paper-raised)] px-3.5 py-2 text-sm text-[var(--ink-soft)] hover:border-[var(--seal)] hover:text-[var(--seal)]"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
