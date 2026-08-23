"use server";

import { createClient } from "@/lib/supabase/server";

export type DictionaryWord = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  studied: boolean;
};

export type DictionaryPageResult = {
  items: DictionaryWord[];
  total: number;
  pageSize: number;
};

const PAGE_SIZE = 60;

// 単語辞書(/learn/dictionary)用。件数が多い(最大1,082件)ため、レベル×ページ単位で
// 必要な分だけ取得する。「学習済み」判定は、そのページに含まれる単語IDだけを絞って
// progressテーブル(item_type="word")に行があるかどうかで行う
// (全件の学習状況を一括取得しない = パフォーマンス配慮)。
export async function getWordDictionaryPage(level: number, page: number): Promise<DictionaryPageResult> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("words")
    .select("id", { count: "exact", head: true })
    .eq("hsk_level", level);

  const total = count ?? 0;
  const from = Math.max(0, (page - 1) * PAGE_SIZE);
  const to = from + PAGE_SIZE - 1;

  const { data: words } = await supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja")
    .eq("hsk_level", level)
    .order("id", { ascending: true })
    .range(from, to);

  const wordIds = (words ?? []).map((w) => w.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let studiedIds = new Set<number>();
  if (user && wordIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("progress")
      .select("item_id")
      .eq("user_id", user.id)
      .eq("item_type", "word")
      .in("item_id", wordIds);
    studiedIds = new Set((progressRows ?? []).map((r) => r.item_id as number));
  }

  const items: DictionaryWord[] = (words ?? []).map((w) => ({
    id: w.id,
    hanzi: w.hanzi,
    pinyin: w.pinyin,
    meaning_ja: w.meaning_ja,
    studied: studiedIds.has(w.id),
  }));

  return { items, total, pageSize: PAGE_SIZE };
}
