"use client";

import { useRouter } from "next/navigation";
import GlassButton from "./GlassButton";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z" />
    </svg>
  );
}

function PandaMascot() {
  return (
    <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
      <circle cx="20" cy="18" r="11" fill="rgba(255,255,255,0.25)" />
      <circle cx="60" cy="18" r="11" fill="rgba(255,255,255,0.25)" />
      <circle cx="20" cy="18" r="5.5" fill="rgba(255,255,255,0.75)" />
      <circle cx="60" cy="18" r="5.5" fill="rgba(255,255,255,0.75)" />
      <circle cx="40" cy="44" r="30" fill="rgba(255,255,255,0.92)" />
      <ellipse cx="40" cy="50" rx="22" ry="18" fill="rgba(255,255,255,0.4)" />
      <circle cx="24" cy="50" r="5" fill="rgba(255,255,255,0.55)" />
      <circle cx="56" cy="50" r="5" fill="rgba(255,255,255,0.55)" />
      <circle cx="31" cy="41" r="3.2" fill="var(--seal-deep)" opacity="0.85" />
      <circle cx="49" cy="41" r="3.2" fill="var(--seal-deep)" opacity="0.85" />
      <path
        d="M36 52 Q40 56 44 52"
        stroke="var(--seal-deep)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export default function HeroReviewCard({ displayName }: { displayName: string }) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: "var(--grad)",
        borderRadius: 24,
        padding: "20px 20px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
            background: "rgba(255,255,255,0.25)",
            color: "#fff",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0 }} />
          ログイン中: {displayName}
        </span>

        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>今日の復習</h2>

        <GlassButton variant="white" size="sm" onClick={() => router.push("/quiz/ai")}>
          <span style={{ color: "var(--seal-deep)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <StarIcon />
            はじめる
          </span>
        </GlassButton>
      </div>

      <div style={{ flexShrink: 0 }}>
        <PandaMascot />
      </div>
    </div>
  );
}
