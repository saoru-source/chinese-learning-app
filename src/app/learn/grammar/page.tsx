import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GrammarDictionaryList from "./GrammarDictionaryList";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

type SentenceRow = { id: number; grammar_point_id: number | null; hanzi: string; meaning_ja: string | null };

// Supabase(PostgREST)は1リクエストあたり暗黙のデフォルト上限(1,000件)を持つ。
// grammar_point_idが設定されたsentencesは4,000件超あり単発の.in()取得では
// 打ち切られるため([[feedback_supabase_max_rows_limit]]と同じ理由)、
// チャンク分割で全件取得する。
const MAX_ROWS_PER_REQUEST = 1000;

async function fetchAllGrammarSentences(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pointIds: number[],
): Promise<SentenceRow[]> {
  if (pointIds.length === 0) return [];

  const all: SentenceRow[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("sentences")
      .select("id, grammar_point_id, hanzi, meaning_ja")
      .in("grammar_point_id", pointIds)
      .order("id", { ascending: true })
      .range(offset, offset + MAX_ROWS_PER_REQUEST - 1);

    const chunk = data ?? [];
    all.push(...chunk);
    if (chunk.length < MAX_ROWS_PER_REQUEST) break;
    offset += MAX_ROWS_PER_REQUEST;
  }
  return all;
}

export default async function GrammarDictionaryPage() {
  const supabase = await createClient();

  const { data: points } = await supabase
    .from("grammar_points")
    .select("id, hsk_level, label, explanation")
    .order("hsk_level", { ascending: true })
    .order("id", { ascending: true });

  const pointIds = (points ?? []).map((p) => p.id);

  // 各文法項目につき例文1件だけを表示する。id昇順で取得しているため、
  // Mapへは各grammar_point_idについて最初に見つかった行(=最小id)だけを
  // セットすればよい。
  const sentenceRows = await fetchAllGrammarSentences(supabase, pointIds);

  const exampleByGrammarPointId = new Map<number, { hanzi: string; meaning_ja: string | null }>();
  for (const row of sentenceRows) {
    if (row.grammar_point_id === null) continue;
    if (exampleByGrammarPointId.has(row.grammar_point_id)) continue;
    exampleByGrammarPointId.set(row.grammar_point_id, { hanzi: row.hanzi, meaning_ja: row.meaning_ja });
  }

  const pointsWithExample = (points ?? []).map((p) => {
    const example = exampleByGrammarPointId.get(p.id);
    return {
      ...p,
      example_hanzi: example?.hanzi ?? null,
      example_meaning_ja: example?.meaning_ja ?? null,
    };
  });

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/learn" aria-label="学習に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>文法辞書</h1>
      </div>

      <GrammarDictionaryList points={pointsWithExample} />
    </main>
  );
}
