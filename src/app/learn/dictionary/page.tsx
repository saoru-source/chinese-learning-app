import Link from "next/link";
import WordDictionaryGrid from "./WordDictionaryGrid";

export default function WordDictionaryPage() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>単語辞書</h1>
        <Link href="/learn" style={{ fontSize: 15.6, textDecoration: "underline", color: "var(--ink-soft)" }}>
          学習に戻る
        </Link>
      </div>

      <WordDictionaryGrid />
    </main>
  );
}
