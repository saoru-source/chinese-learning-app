import type { SupabaseClient } from "@supabase/supabase-js";
import type { Segment } from "@/components/TappableText";
import { buildSegmentsFromDict } from "@/lib/words/segment";

// 長文(300字超)は候補文字列が1000件を超えるため、src/lib/words/segment.tsの
// tokenizeSentence(候補文字列を.in()で問い合わせる方式)だとSupabaseへの
// クエリが失敗する(実測で364字・候補1219件のとき"Bad Request")。
// 長文はそのHSKレベル以下の単語だけを使って書かれている設計方針
// (CLAUDE.md参照)なので、hsk_level <= maxLevel の単語を一括取得して
// メモリ上で貪欲最長一致する方式に切り替えている。
const PAGE_SIZE = 1000;

export async function tokenizePassage(
  supabase: SupabaseClient,
  text: string,
  maxLevel: number,
): Promise<Segment[]> {
  // Supabase(PostgREST)のデフォルトmax_rowsが1000件のため、1回のクエリでは
  // HSK4以上の語彙(2,639件〜)を全件取得できない。範囲取得をページングして
  // 全件集める。
  const words: { hanzi: string; pinyin: string | null; meaning_ja: string | null }[] = [];
  let from = 0;
  for (;;) {
    const { data } = await supabase
      .from("words")
      .select("hanzi, pinyin, meaning_ja")
      .lte("hsk_level", maxLevel)
      .range(from, from + PAGE_SIZE - 1);
    words.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const dict = new Map(words.map((w) => [w.hanzi, w]));
  return buildSegmentsFromDict(text, dict);
}
