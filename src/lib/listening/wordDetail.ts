import { SupabaseClient } from "@supabase/supabase-js";
import { tokenizeSentence } from "@/lib/words/segment";
import type { Segment } from "@/components/TappableText";

export type ListeningWordDetail = {
  word: { id: number; hanzi: string; pinyin: string | null; meaning_ja: string | null };
  example: { hanzi: string; pinyin: string | null; meaning_ja: string | null } | null;
  exampleSegments: Segment[] | null;
};

// ヒアリング問題(listening_questions)のtext_zhは、CLAUDE.md記載の通り
// wordsテーブルを元に自動生成されており、実データで確認した限り
// text_zhとwords.hanziの完全一致で紐付く(120問中119件がexact match)。
// 該当単語が見つかった場合、/wordsページと同じロジック(sentences.hanziの
// ILIKE検索で例文を1件取得)で例文も合わせて取得する。
export async function fetchListeningWordDetail(
  supabase: SupabaseClient,
  textZh: string
): Promise<ListeningWordDetail | null> {
  const { data: wordRows } = await supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja")
    .eq("hanzi", textZh)
    .limit(1);

  const word = wordRows?.[0];
  if (!word) return null;

  const { data: exampleRows } = await supabase
    .from("sentences")
    .select("hanzi, pinyin, meaning_ja")
    .ilike("hanzi", `%${word.hanzi}%`)
    .order("hsk_level", { ascending: true })
    .order("id", { ascending: true })
    .limit(1);

  const example = exampleRows?.[0] ?? null;
  const exampleSegments = example ? await tokenizeSentence(supabase, example.hanzi) : null;

  return { word, example, exampleSegments };
}
