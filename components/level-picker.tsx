import { LEVELS, type Level } from "./levels";

export function LevelPicker({
  value,
  onChange,
}: {
  value: Level;
  onChange: (level: Level) => void;
}) {
  return (
    <div
      className="flex rounded-full bg-[var(--paper-deep)] p-0.5 ring-1 ring-[var(--line)]"
      role="radiogroup"
      aria-label="Nivå"
    >
      {LEVELS.map((level) => {
        const selected = value === level.id;
        return (
          <button
            key={level.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(level.id)}
            className={
              selected
                ? "rounded-full bg-[var(--seal)] px-2.5 py-1.5 text-xs font-semibold text-[var(--paper-raised)] sm:px-3"
                : "rounded-full px-2.5 py-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] sm:px-3"
            }
          >
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
