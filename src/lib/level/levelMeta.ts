export type LevelKey = 1 | 2 | 3 | 4 | 5 | 6;

export const LEVEL_KEYS: LevelKey[] = [1, 2, 3, 4, 5, 6];

export const DEFAULT_LEVEL: LevelKey = 1;

export const LEVEL_META: Record<LevelKey, { label: string }> = {
  1: { label: "HSK1" },
  2: { label: "HSK2" },
  3: { label: "HSK3" },
  4: { label: "HSK4" },
  5: { label: "HSK5" },
  6: { label: "HSK6" },
};

export function isLevelKey(value: number | string | null | undefined): value is LevelKey {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && (LEVEL_KEYS as number[]).includes(n);
}
