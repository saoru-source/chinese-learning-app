import { SupabaseClient } from "@supabase/supabase-js";

export type WritingGrammarPoint = {
  id: number;
  hsk_level: number;
  label: string;
  explanation: string | null;
};

// 「文法の型で例文添削」(/writing/grammar)の一覧用。該当レベルの文法項目
// 全件を、苦手(不正解数が正解数以上)→未学習→学習済みの順に並べ替えて
// 返す(苦手内では不正解数が多い順)。AI出題のgetWeakGrammarPoints
// (src/lib/quiz/select.ts)はlimit件だけを返す設計だが、一覧表示には
// 全件必要なため別関数として用意する。
export async function getGrammarPointsByWeakness(
  supabase: SupabaseClient,
  userId: string,
  level: number,
): Promise<WritingGrammarPoint[]> {
  const { data: points } = await supabase
    .from("grammar_points")
    .select("id, hsk_level, label, explanation")
    .eq("hsk_level", level)
    .order("id", { ascending: true });

  const all = points ?? [];
  if (all.length === 0) return [];

  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_id, correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", "grammar");

  const progressById = new Map((progressRows ?? []).map((p) => [p.item_id, p]));

  function rank(id: number): number {
    const p = progressById.get(id);
    if (!p) return 1; // 未学習
    if (p.incorrect_count >= p.correct_count) return 0; // 苦手
    return 2; // 学習済み(苦手でない)
  }

  return [...all].sort((a, b) => {
    const rankDiff = rank(a.id) - rank(b.id);
    if (rankDiff !== 0) return rankDiff;

    const pa = progressById.get(a.id);
    const pb = progressById.get(b.id);
    if (pa && pb) {
      const weaknessDiff = pb.incorrect_count - pb.correct_count - (pa.incorrect_count - pa.correct_count);
      if (weaknessDiff !== 0) return weaknessDiff;
    }
    return a.id - b.id;
  });
}
