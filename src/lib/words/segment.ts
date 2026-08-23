import type { SupabaseClient } from "@supabase/supabase-js";
import type { Segment } from "@/components/TappableText";

const MAX_WORD_LEN = 4;

// sentencesテーブルはwordsテーブルと直接の外部キーを持たないため、
// 例文中の単語をタップ可能にするには実行時に分かち書きが必要になる。
// wordsテーブル全体(4,680件)を毎回取得すると重いので、文中に実際に
// 現れうる1〜4文字の部分文字列だけを候補としてwordsに存在するか問い合わせ、
// 辞書に載っている単語を貪欲最長一致で優先的に切り出す
// (CLAUDE.mdの長文読解コンテンツチェックと同じ考え方)。
export async function tokenizeSentence(
  supabase: SupabaseClient,
  text: string,
): Promise<Segment[]> {
  const candidates = new Set<string>();
  for (let len = MAX_WORD_LEN; len >= 1; len--) {
    for (let i = 0; i + len <= text.length; i++) {
      candidates.add(text.slice(i, i + len));
    }
  }
  if (candidates.size === 0) return [text];

  const { data } = await supabase
    .from("words")
    .select("hanzi, pinyin, meaning_ja")
    .in("hanzi", Array.from(candidates));

  const dict = new Map((data ?? []).map((w) => [w.hanzi as string, w]));

  const segments: Segment[] = [];
  let buffer = "";
  let i = 0;
  while (i < text.length) {
    let matchedLen = 0;
    for (let len = Math.min(MAX_WORD_LEN, text.length - i); len >= 1; len--) {
      if (dict.has(text.slice(i, i + len))) {
        matchedLen = len;
        break;
      }
    }
    if (matchedLen > 0) {
      if (buffer) {
        segments.push(buffer);
        buffer = "";
      }
      const slice = text.slice(i, i + matchedLen);
      const w = dict.get(slice)!;
      segments.push({
        word: { zh: slice, pinyin: (w.pinyin as string) ?? "", ja: (w.meaning_ja as string) ?? "" },
      });
      i += matchedLen;
    } else {
      buffer += text[i];
      i += 1;
    }
  }
  if (buffer) segments.push(buffer);
  return segments;
}
