// Math.randomをコンポーネント本体(サーバーコンポーネントのレンダー関数内)で
// 直接呼び出すとreact-hooks/purityのlintエラーになるため、通常のユーティリティ
// 関数に切り出している(src/lib/listening/pickRandom.tsと同じ方針)。

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sampleWithoutReplacement<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}
