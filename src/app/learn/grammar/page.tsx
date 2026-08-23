import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GrammarDictionaryList from "./GrammarDictionaryList";

export default async function GrammarDictionaryPage() {
  const supabase = await createClient();

  const { data: points } = await supabase
    .from("grammar_points")
    .select("id, hsk_level, label, explanation")
    .order("hsk_level", { ascending: true })
    .order("id", { ascending: true });

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>文法辞書</h1>
        <Link href="/learn" style={{ fontSize: 13, textDecoration: "underline", color: "var(--ink-soft)" }}>
          学習に戻る
        </Link>
      </div>

      <GrammarDictionaryList points={points ?? []} />
    </main>
  );
}
