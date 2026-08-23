// Math.randomをコンポーネント本体(サーバーコンポーネントのレンダー関数内)で
// 直接呼び出すとreact-hooks/purityのlintエラーになるため、通常のユーティリティ
// 関数に切り出している。
export function randomOffset(total: number): number {
  return Math.floor(Math.random() * total);
}
