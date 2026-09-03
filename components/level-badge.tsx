import { levelHint, levelLabel, type Level } from "./levels";

export function LevelBadge({
  level,
  size = "md",
}: {
  level: Level;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={
        size === "sm"
          ? "inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/50 bg-[var(--paper-raised)] px-2.5 py-1"
          : "rounded-2xl border border-[var(--gold)]/40 bg-[var(--paper-raised)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
      }
      aria-label={`Din nivå: ${levelLabel(level)}`}
    >
      <span className="inline-flex h-2 w-2 rounded-full bg-[var(--seal)]" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-soft)] uppercase">
          Din nivå
        </p>
        <p className="font-serif text-sm leading-tight text-[var(--ink)]">
          {levelLabel(level)}
        </p>
        {size === "md" ? (
          <p className="text-[11px] text-[var(--ink-soft)]">{levelHint(level)}</p>
        ) : null}
      </div>
    </div>
  );
}
