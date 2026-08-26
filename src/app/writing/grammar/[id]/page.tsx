import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GrammarWritingForm from "./GrammarWritingForm";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default async function GrammarWritingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: point } = await supabase
    .from("grammar_points")
    .select("id, hsk_level, label, explanation")
    .eq("id", id)
    .maybeSingle();

  if (!point) {
    notFound();
  }

  // 文法辞書(/learn/grammar)に投入済みの参考例文があれば、ヒントとして
  // あわせて表示する(該当例文が複数あってもid昇順で先頭の1件のみ使う。
  // /learn/grammarと同じ「1項目1例文」の方針)。
  const { data: exampleRows } = await supabase
    .from("sentences")
    .select("hanzi, meaning_ja")
    .eq("grammar_point_id", point.id)
    .order("id", { ascending: true })
    .limit(1);
  const example = exampleRows?.[0] ?? null;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/writing/grammar" aria-label="文法の型で例文添削に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>文法の型で例文添削</h1>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "20px 20px",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "var(--grad)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 20,
            padding: "3px 12px",
            marginBottom: 12,
          }}
        >
          HSK{point.hsk_level}
        </span>
        <p style={{ fontSize: 20.4, fontWeight: 700, color: "var(--ink)", lineHeight: 1.6 }}>{point.label}</p>
        {point.explanation && (
          <p style={{ fontSize: 15.6, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.6 }}>
            {point.explanation}
          </p>
        )}
        {example && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>参考例文</p>
            <p style={{ fontSize: 16.8, color: "var(--ink)" }}>{example.hanzi}</p>
            {example.meaning_ja && (
              <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginTop: 2 }}>{example.meaning_ja}</p>
            )}
          </div>
        )}
      </div>

      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 12 }}>
        この文法パターンを使って、自分で中国語の例文を作ってください。
      </p>

      <GrammarWritingForm key={point.id} grammarPointId={point.id} />
    </main>
  );
}
