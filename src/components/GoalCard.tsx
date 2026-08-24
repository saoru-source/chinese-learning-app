"use client";

import { useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    void setGoalText(goal);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
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
            fontSize: 9,
            fontWeight: 700,
            color: "var(--ink-soft)",
            letterSpacing: "0.1em",
            marginBottom: 2,
          }}
        >
          目標
        </div>
        <input
          ref={inputRef}
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--ink)",
            padding: 0,
          }}
        />
      </div>

      <span style={{ flexShrink: 0, fontSize: 9, color: "var(--ink-soft)", opacity: 0.6 }}>タップで編集</span>
    </div>
  );
}
