export type Level = "beginner" | "student" | "developer";

export const LEVELS: readonly {
  id: Level;
  label: string;
  hint: string;
}[] = [
  {
    id: "beginner",
    label: "Nybörjare",
    hint: "Enkla bilder, lite kod",
  },
  {
    id: "student",
    label: "Student",
    hint: "Begrepp + exempel",
  },
  {
    id: "developer",
    label: "Utvecklare",
    hint: "Kort, precist, fallgropar",
  },
] as const;

export function levelLabel(level: Level) {
  return LEVELS.find((item) => item.id === level)?.label ?? "Nybörjare";
}

export function levelHint(level: Level) {
  return LEVELS.find((item) => item.id === level)?.hint ?? "";
}
