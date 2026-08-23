export type ThemeKey = "yebe" | "burube" | "green" | "purple" | "jirai";

export const THEME_KEYS: ThemeKey[] = ["yebe", "burube", "green", "purple", "jirai"];

export const DEFAULT_THEME: ThemeKey = "yebe";

// テーマ選択ドット/スウォッチのプレビュー表示専用の代表色。
// globals.cssの[data-theme]ブロックが実際の描画に使う単一の情報源であり、
// ここは「非アクティブなテーマの見た目をプレビューする」ために手動で複製した値。
// globals.css側の配色を変更したら、この一覧も合わせて更新すること。
export const THEME_META: Record<ThemeKey, { label: string; swatch: [string, string, string] }> = {
  yebe: { label: "ピンク", swatch: ["#F0A8CE", "#86E8D4", "#FFC8E0"] },
  burube: { label: "ブルー", swatch: ["#90D8F8", "#88D0FF", "#C8ECFF"] },
  green: { label: "グリーン", swatch: ["#B8E878", "#F5BBD4", "#D8F898"] },
  purple: { label: "パープル", swatch: ["#C0B8F8", "#F8C0E8", "#DDD8FF"] },
  jirai: { label: "地雷", swatch: ["#E0C0CC", "#C8C8DC", "#EDD8E4"] },
};

export function isThemeKey(value: string | null | undefined): value is ThemeKey {
  return !!value && (THEME_KEYS as string[]).includes(value);
}
