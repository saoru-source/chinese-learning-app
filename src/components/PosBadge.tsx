// 単語の品詞(名詞/動詞/形容詞等)を示す小さなバッジ。word_typeが未設定(null)の
// 単語では何も表示しない(呼び出し側で条件分岐せずに済むよう、ここでnullを返す)。
export default function PosBadge({
  type,
  fontSize = 12,
}: {
  type?: string | null;
  fontSize?: number;
}) {
  if (!type) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        whiteSpace: "nowrap",
        fontSize,
        fontWeight: 700,
        color: "var(--ink-soft)",
        background: "var(--paper-deep)",
        borderRadius: 999,
        padding: "2px 8px",
      }}
    >
      {type}
    </span>
  );
}
