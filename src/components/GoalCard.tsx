"use client";

import { useId, useRef, useState } from "react";
import { setGoalText } from "@/lib/goal/actions";

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="white" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="white" />
    </svg>
  );
}

const DEFAULT_GOAL = "HSK4合格を目指す";

// テーマ切り替え(src/lib/theme/actions.ts)と同じ方針: ログイン中はusers.goal_text
// に保存し、未ログイン(ゲスト)時はこのローカルstateのみで完結する(リロードで消える)。
export default function GoalCard({ initialGoal }: { initialGoal?: string | null }) {
  const [goal, setGoal] = useState(initialGoal ?? DEFAULT_GOAL);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // iOSのSafari系ブラウザ(Chrome for iOSもWebKitベース)は、autocomplete="off"を
  // 付けても固定のname値に対してパスワード/カード/連絡先のオートフィル候補を
  // 出し続けることがある。レンダーごとに一意なnameにすることで、OS側が
  // この欄を特定の入力欄として学習・キャッシュできないようにする。
  const id = useId();
  const dynamicName = `goal-${id}`;

  const handleBlur = () => {
    void setGoalText(goal);
  };

  // <textarea>は複数行入力が可能なUIだが、目標欄は1行のみを想定しているため、
  // Enterキーでの改行を無効化し、代わりに確定(blur)扱いにする。
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  // 改行を含むペーストへの対策(念のため、キー入力以外の経路で改行が
  // 混入した場合もスペースに置き換えて1行を保つ)。
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoal(e.target.value.replace(/\n/g, " "));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--card)",
        borderRadius: 16,
        padding: "12px 16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        cursor: "text",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "var(--grad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TargetIcon />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10.8,
            fontWeight: 700,
            color: "var(--ink-soft)",
            letterSpacing: "0.1em",
            marginBottom: 2,
          }}
        >
          目標
        </div>
        <textarea
          ref={inputRef}
          // <input>はChrome for iOS等がautocomplete="off"やtype指定を無視して
          // パスワード/カード/住所のAutoFill候補バーを出すことがあるため、
          // 単一行の識別情報欄とは見なされにくい<textarea>(自由記述用の
          // フォーム部品)に変更した。rows=1・改行禁止(handleKeyDown/
          // handleChange)・下記styleで、見た目・挙動は元の1行入力欄と
          // 同じになるようにしている。
          rows={1}
          name={dynamicName}
          autoComplete="off"
          value={goal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "block",
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15.6,
            fontWeight: 700,
            color: "var(--ink)",
            padding: 0,
            margin: 0,
            resize: "none",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            lineHeight: 1.3,
          }}
        />
      </div>

      <span style={{ flexShrink: 0, fontSize: 10.8, color: "var(--ink-soft)", opacity: 0.6 }}>タップで編集</span>
    </div>
  );
}
