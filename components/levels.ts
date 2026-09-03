export type Level = "beginner" | "student" | "developer";

export const LEVELS: readonly { id: Level; label: string }[] = [
  { id: "beginner", label: "Nybörjare" },
  { id: "student", label: "Student" },
  { id: "developer", label: "Utvecklare" },
] as const;
