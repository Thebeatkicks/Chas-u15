import { COPY } from "./copy";

export function EmptyState({
  onPickSuggestion,
}: {
  onPickSuggestion: (text: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-700 bg-teal-50 font-serif text-xl text-teal-800">
        JS
      </div>
      <h2 className="font-serif text-2xl text-zinc-900">{COPY.emptyTitle}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
        {COPY.emptyBody}
      </p>
      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {COPY.suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onPickSuggestion(suggestion)}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:border-teal-700 hover:text-teal-800"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
