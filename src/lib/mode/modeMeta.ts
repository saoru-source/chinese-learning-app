export type ModeKey = "light" | "dark";

export const MODE_KEYS: ModeKey[] = ["light", "dark"];

export const DEFAULT_MODE: ModeKey = "light";

export function isModeKey(value: string | null | undefined): value is ModeKey {
  return value === "light" || value === "dark";
}
