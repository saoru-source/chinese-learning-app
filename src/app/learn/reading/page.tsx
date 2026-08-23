"use client";

import Link from "next/link";
import { useLevel } from "@/lib/level/LevelContext";
import MenuTile from "@/components/MenuTile";
import { PatternsIcon, LongReadingIcon } from "@/components/learnIcons";

export default function LearnReadingPage() {
  const { levelKey } = useLevel();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>読む</h1>
        <Link href="/learn" style={{ fontSize: 13, textDecoration: "underline", color: "var(--ink-soft)" }}>
          学習に戻る
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MenuTile
          label="例文パターン集"
          icon={<PatternsIcon />}
          gradient="linear-gradient(135deg, var(--jade), var(--jade-deep))"
          href={`/patterns?level=${levelKey}`}
        />
        <MenuTile
          label="長文読解"
          icon={<LongReadingIcon />}
          gradient="linear-gradient(135deg, var(--gold), var(--gold-deep))"
          href={`/reading?level=${levelKey}`}
        />
      </div>
    </main>
  );
}
