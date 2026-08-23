"use client";

import Link from "next/link";
import { useLevel } from "@/lib/level/LevelContext";
import MenuTile from "@/components/MenuTile";
import {
  SpeakIcon,
  ListenIcon,
  ReadIcon,
  WriteIcon,
  QuizIcon,
  GrammarDictIcon,
  WordDictIcon,
} from "@/components/learnIcons";

export default function LearnPage() {
  const { levelKey } = useLevel();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>学習</h1>
        <Link href="/" style={{ fontSize: 13, textDecoration: "underline", color: "var(--ink-soft)" }}>
          トップに戻る
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MenuTile label="話す" icon={<SpeakIcon />} gradient="var(--grad)" href="/learn/speaking" />
        <MenuTile
          label="聞く"
          icon={<ListenIcon />}
          gradient="linear-gradient(135deg, var(--jade), var(--jade-deep))"
          href={`/listening?level=${levelKey}`}
        />
        <MenuTile label="読む" icon={<ReadIcon />} gradient="linear-gradient(135deg, var(--gold), var(--gold-deep))" href="/learn/reading" />
        <MenuTile
          label="書く"
          icon={<WriteIcon />}
          gradient="linear-gradient(135deg, var(--seal), var(--gold))"
          href={`/writing?level=${levelKey}`}
        />
        <MenuTile
          label="文法ドリル／単語ドリル"
          icon={<QuizIcon />}
          gradient="linear-gradient(135deg, var(--lavender), var(--seal-deep))"
          href={`/quiz/ai?level=${levelKey}`}
        />
        <MenuTile label="文法辞書" icon={<GrammarDictIcon soft />} gradient="var(--paper-deep)" badge="近日公開" />
        <MenuTile label="単語辞書" icon={<WordDictIcon soft />} gradient="var(--paper-deep)" badge="近日公開" />
      </div>
    </main>
  );
}
