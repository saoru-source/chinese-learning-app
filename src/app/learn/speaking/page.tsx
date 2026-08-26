"use client";

import Link from "next/link";
import { useLevel } from "@/lib/level/LevelContext";
import MenuTile from "@/components/MenuTile";
import { WordsIcon, StepwiseIcon, GroupsIcon, PatternsIcon, ConversationIcon } from "@/components/learnIcons";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default function LearnSpeakingPage() {
  const { levelKey } = useLevel();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/learn" aria-label="学習に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>話す</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MenuTile label="単語" icon={<WordsIcon />} gradient="var(--grad)" href={`/words?level=${levelKey}`} />
        <MenuTile
          label="段階的暗記"
          icon={<StepwiseIcon />}
          gradient="linear-gradient(135deg, var(--jade), var(--jade-deep))"
          href={`/study?level=${levelKey}`}
        />
        <MenuTile
          label="グループ暗記"
          icon={<GroupsIcon />}
          gradient="linear-gradient(135deg, var(--lavender), var(--seal-deep))"
          href={`/groups?level=${levelKey}`}
        />
        <MenuTile
          label="例文パターン集"
          icon={<PatternsIcon />}
          gradient="linear-gradient(135deg, var(--jade), var(--lavender))"
          href={`/patterns?level=${levelKey}`}
        />
        <MenuTile
          label="会話練習"
          icon={<ConversationIcon />}
          gradient="linear-gradient(135deg, var(--gold), var(--seal-deep))"
          href={`/conversations?level=${levelKey}`}
        />
      </div>
    </main>
  );
}
