"use client";

import Link from "next/link";
import { useLevel } from "@/lib/level/LevelContext";
import MenuTile from "@/components/MenuTile";
import { WordsIcon, StepwiseIcon, GroupsIcon, PatternsIcon, ConversationIcon } from "@/components/learnIcons";

export default function LearnSpeakingPage() {
  const { levelKey } = useLevel();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>話す</h1>
        <Link href="/learn" style={{ fontSize: 15.6, textDecoration: "underline", color: "var(--ink-soft)" }}>
          学習に戻る
        </Link>
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
