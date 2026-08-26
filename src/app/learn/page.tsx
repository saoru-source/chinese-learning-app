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
  MilestoneIcon,
  GraduationIcon,
} from "@/components/learnIcons";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export default function LearnPage() {
  const { levelKey } = useLevel();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/" aria-label="トップに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>学習</h1>
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
        <MenuTile
          label="文法辞書"
          icon={<GrammarDictIcon />}
          gradient="linear-gradient(135deg, var(--seal), var(--seal-deep))"
          href={`/learn/grammar?level=${levelKey}`}
        />
        <MenuTile
          label="単語辞書"
          icon={<WordDictIcon />}
          gradient="linear-gradient(135deg, var(--gold), var(--jade-deep))"
          href={`/learn/dictionary?level=${levelKey}`}
        />
        <MenuTile
          label="節目テスト"
          icon={<MilestoneIcon />}
          gradient="linear-gradient(135deg, var(--jade), var(--gold))"
          href="/milestones"
        />
        <MenuTile
          label="卒業試験"
          icon={<GraduationIcon />}
          gradient="linear-gradient(135deg, var(--gold), var(--seal))"
          href="/graduation"
        />
      </div>
    </main>
  );
}
