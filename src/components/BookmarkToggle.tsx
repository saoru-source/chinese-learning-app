"use client";

import { useState } from "react";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path
        d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
        fill={filled ? "var(--seal)" : "none"}
        stroke={filled ? "var(--seal)" : "var(--line)"}
        strokeWidth={filled ? 0 : 1.5}
      />
    </svg>
  );
}

// ユーザーごとの単語保存/お気に入りに対応するテーブルが現状存在しないため、
// このトグルは見た目だけのUI状態(非永続)。ページ遷移(前へ/次へ)のたびに
// サーバーコンポーネントごと再マウントされるためリセットされる。
// 永続化する場合は user_id + word_id の中間テーブルを別途migrationで追加する必要がある
// (Figma側もこのあたりの永続化仕様は未確定のため、今回はここまで)。
export default function BookmarkToggle() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? "ブックマークを解除" : "ブックマークに追加"}
      onClick={() => setSaved((v) => !v)}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        lineHeight: 0,
      }}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}
