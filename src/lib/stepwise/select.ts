import { SupabaseClient } from "@supabase/supabase-js";

export type NewWord = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  hsk_level: number;
};

// 「段階的暗記モード」: まだ覚えていない新出単語を、現在のHSKレベル設定
// 内から選ぶ。「まだ覚えていない」の定義は、間隔反復(spaced repetition、
// src/lib/words/reviewProgress.ts)のreview_stageが0の単語
// (=progress行が無い、またはまだ一度も復習段階を進められていない単語)。
// id順に取得し、先頭からsessionSize件を1セッションぶんとする。
export async function pickNewWords(
  supabase: SupabaseClient,
  userId: string,
  level: number,
  sessionSize: number
): Promise<NewWord[]> {
  const { data: words } = await supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level")
    .eq("hsk_level", level)
    .order("id", { ascending: true });

  const allWords = words ?? [];
  if (allWords.length === 0) return [];

  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_id, review_stage")
    .eq("user_id", userId)
    .eq("item_type", "word")
    .in(
      "item_id",
      allWords.map((w) => w.id)
    );

  const stageMap = new Map<number, number>();
  for (const row of progressRows ?? []) {
    stageMap.set(row.item_id as number, row.review_stage as number);
  }

  const candidates = allWords.filter((w) => (stageMap.get(w.id) ?? 0) === 0);
  return candidates.slice(0, sessionSize);
}
