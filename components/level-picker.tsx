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
      className="flex rounded-full bg-zinc-100 p-0.5 ring-1 ring-zinc-200"
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
                ? "rounded-full bg-teal-700 px-2.5 py-1.5 text-xs font-semibold text-white sm:px-3"
                : "rounded-full px-2.5 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 sm:px-3"
            }
          >
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
