import type { UIMessage } from "@ai-sdk/react";

function sourceParts(message: UIMessage) {
  return message.parts.filter(
    (part): part is Extract<UIMessage["parts"][number], { type: "source-url" }> =>
      part.type === "source-url",
  );
}

export function SourceChips({ message }: { message: UIMessage }) {
  const sources = sourceParts(message);
  if (sources.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-semibold tracking-[0.16em] text-[var(--ink-soft)] uppercase">
        Källor
      </p>
      <ul className="flex flex-wrap gap-2">
        {sources.map((part) => (
          <li key={part.sourceId}>
            <a
              href={part.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[var(--seal)]/70 bg-[var(--paper-raised)] px-2.5 py-1 text-xs text-[var(--seal-deep)] hover:bg-[#f3e2d6]"
            >
              {part.title ?? part.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
